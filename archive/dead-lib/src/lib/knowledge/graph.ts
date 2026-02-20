/**
 * Task 233: Knowledge Graph Engine
 *
 * Implements entity linking, relation extraction, ontology management,
 * semantic reasoning, and graph embeddings.
 */

import prisma from "@/lib/prisma";

export type EntityType = "person" | "organization" | "location" | "concept" | "event" | "custom";
export type RelationType =
  | "is_a"
  | "part_of"
  | "related_to"
  | "caused_by"
  | "located_in"
  | "works_for"
  | "custom";

export interface KnowledgeEntity {
  id: string;
  type: EntityType;
  name: string;
  aliases: string[];
  description?: string;
  properties: Record<string, any>;
  embedding?: number[];
  confidence: number;
  source?: string;
  createdAt: Date;
}

export interface KnowledgeRelation {
  id: string;
  subject: string;
  predicate: RelationType;
  object: string;
  properties: Record<string, any>;
  confidence: number;
  source?: string;
  createdAt: Date;
}

export interface Triple {
  subject: KnowledgeEntity;
  predicate: RelationType;
  object: KnowledgeEntity;
}

export interface OntologyClass {
  id: string;
  name: string;
  parent?: string;
  properties: string[];
  constraints: Record<string, any>;
}

/**
 * Create knowledge entity
 */
export async function createEntity(
  name: string,
  type: EntityType,
  options?: {
    aliases?: string[];
    description?: string;
    properties?: Record<string, any>;
    confidence?: number;
  }
): Promise<KnowledgeEntity> {
  const embedding = await generateEmbedding(name);

  const entity = await prisma.knowledgeEntity.create({
    data: {
      type,
      name,
      aliases: options?.aliases || [],
      description: options?.description,
      properties: options?.properties || {},
      embedding,
      confidence: options?.confidence || 1.0,
    },
  });

  return entity as KnowledgeEntity;
}

/**
 * Create relation
 */
export async function createRelation(
  subjectId: string,
  predicate: RelationType,
  objectId: string,
  options?: {
    properties?: Record<string, any>;
    confidence?: number;
  }
): Promise<KnowledgeRelation> {
  const relation = await prisma.knowledgeRelation.create({
    data: {
      subject: subjectId,
      predicate,
      object: objectId,
      properties: options?.properties || {},
      confidence: options?.confidence || 1.0,
    },
  });

  return relation as KnowledgeRelation;
}

/**
 * Link entity (entity resolution)
 */
export async function linkEntity(text: string): Promise<KnowledgeEntity | null> {
  const entities = await prisma.knowledgeEntity.findMany();

  const textLower = text.toLowerCase();

  // Exact match
  for (const entity of entities) {
    if (entity.name.toLowerCase() === textLower) {
      return entity as KnowledgeEntity;
    }

    if (entity.aliases.some((alias) => alias.toLowerCase() === textLower)) {
      return entity as KnowledgeEntity;
    }
  }

  // Fuzzy match
  const embedding = await generateEmbedding(text);
  let bestMatch: any = null;
  let bestScore = 0;

  for (const entity of entities) {
    if (!entity.embedding) continue;

    const similarity = cosineSimilarity(embedding, entity.embedding);
    if (similarity > bestScore && similarity > 0.8) {
      bestScore = similarity;
      bestMatch = entity;
    }
  }

  return bestMatch;
}

/**
 * Extract relations from text
 */
export async function extractRelations(text: string): Promise<Triple[]> {
  const triples: Triple[] = [];

  // Simplified relation extraction using patterns
  const patterns = [
    { regex: /(\w+)\s+is\s+a\s+(\w+)/gi, predicate: "is_a" as RelationType },
    { regex: /(\w+)\s+part\s+of\s+(\w+)/gi, predicate: "part_of" as RelationType },
    { regex: /(\w+)\s+located\s+in\s+(\w+)/gi, predicate: "located_in" as RelationType },
    { regex: /(\w+)\s+works\s+for\s+(\w+)/gi, predicate: "works_for" as RelationType },
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.regex.exec(text)) !== null) {
      const subjectText = match[1];
      const objectText = match[2];

      let subject = await linkEntity(subjectText);
      if (!subject) {
        subject = await createEntity(subjectText, "custom", { confidence: 0.7 });
      }

      let object = await linkEntity(objectText);
      if (!object) {
        object = await createEntity(objectText, "custom", { confidence: 0.7 });
      }

      await createRelation(subject.id, pattern.predicate, object.id);

      triples.push({ subject, predicate: pattern.predicate, object });
    }
  }

  return triples;
}

/**
 * Query knowledge graph
 */
export async function queryGraph(pattern: {
  subject?: string;
  predicate?: RelationType;
  object?: string;
}): Promise<Triple[]> {
  const where: any = {};

  if (pattern.subject) where.subject = pattern.subject;
  if (pattern.predicate) where.predicate = pattern.predicate;
  if (pattern.object) where.object = pattern.object;

  const relations = await prisma.knowledgeRelation.findMany({ where });

  const triples: Triple[] = [];

  for (const rel of relations) {
    const subject = await prisma.knowledgeEntity.findUnique({
      where: { id: rel.subject },
    });
    const object = await prisma.knowledgeEntity.findUnique({
      where: { id: rel.object },
    });

    if (subject && object) {
      triples.push({
        subject: subject as KnowledgeEntity,
        predicate: rel.predicate as RelationType,
        object: object as KnowledgeEntity,
      });
    }
  }

  return triples;
}

/**
 * Infer new relations (simple reasoning)
 */
export async function inferRelations(): Promise<KnowledgeRelation[]> {
  const inferred: KnowledgeRelation[] = [];

  // Transitivity: if A->B and B->C, then A->C
  const relations = await prisma.knowledgeRelation.findMany({
    where: { predicate: "is_a" },
  });

  for (const rel1 of relations) {
    const rel2List = relations.filter((r) => r.subject === rel1.object);

    for (const rel2 of rel2List) {
      // Check if A->C already exists
      const existing = await prisma.knowledgeRelation.findFirst({
        where: {
          subject: rel1.subject,
          object: rel2.object,
          predicate: "is_a",
        },
      });

      if (!existing) {
        const newRelation = await createRelation(rel1.subject, "is_a", rel2.object, {
          confidence: 0.8,
        });
        inferred.push(newRelation);
      }
    }
  }

  return inferred;
}

/**
 * Create ontology class
 */
export async function createOntologyClass(
  name: string,
  options?: {
    parent?: string;
    properties?: string[];
    constraints?: Record<string, any>;
  }
): Promise<OntologyClass> {
  const ontologyClass = await prisma.ontologyClass.create({
    data: {
      name,
      parent: options?.parent,
      properties: options?.properties || [],
      constraints: options?.constraints || {},
    },
  });

  return ontologyClass as OntologyClass;
}

/**
 * Validate entity against ontology
 */
export async function validateEntity(
  entityId: string
): Promise<{ valid: boolean; violations: string[] }> {
  const entity = await prisma.knowledgeEntity.findUnique({
    where: { id: entityId },
  });

  if (!entity) return { valid: false, violations: ["Entity not found"] };

  const violations: string[] = [];

  // Check if entity type exists in ontology
  const ontologyClass = await prisma.ontologyClass.findFirst({
    where: { name: entity.type },
  });

  if (!ontologyClass) {
    violations.push(`Entity type '${entity.type}' not defined in ontology`);
  } else {
    // Check required properties
    for (const prop of ontologyClass.properties) {
      if (!entity.properties[prop]) {
        violations.push(`Missing required property: ${prop}`);
      }
    }
  }

  return { valid: violations.length === 0, violations };
}

/**
 * Generate embedding
 */
async function generateEmbedding(text: string): Promise<number[]> {
  // Simplified embedding generation (in production, use real model)
  const embedding: number[] = [];

  for (let i = 0; i < 128; i++) {
    let value = 0;
    for (let j = 0; j < text.length; j++) {
      value += text.charCodeAt(j) * (i + j);
    }
    embedding.push((value % 1000) / 1000 - 0.5);
  }

  return embedding;
}

/**
 * Cosine similarity
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Get entity neighborhood
 */
export async function getNeighborhood(
  entityId: string,
  depth: number = 2
): Promise<{ entities: KnowledgeEntity[]; relations: KnowledgeRelation[] }> {
  const entities = new Map<string, KnowledgeEntity>();
  const relations: KnowledgeRelation[] = [];
  const visited = new Set<string>();

  async function explore(id: string, currentDepth: number): Promise<void> {
    if (currentDepth > depth || visited.has(id)) return;

    visited.add(id);

    const entity = await prisma.knowledgeEntity.findUnique({
      where: { id },
    });

    if (entity) entities.set(id, entity as KnowledgeEntity);

    const outgoing = await prisma.knowledgeRelation.findMany({
      where: { subject: id },
    });

    const incoming = await prisma.knowledgeRelation.findMany({
      where: { object: id },
    });

    for (const rel of [...outgoing, ...incoming]) {
      relations.push(rel as KnowledgeRelation);
      const nextId = rel.subject === id ? rel.object : rel.subject;
      await explore(nextId, currentDepth + 1);
    }
  }

  await explore(entityId, 0);

  return { entities: Array.from(entities.values()), relations };
}

export { EntityType, KnowledgeEntity, KnowledgeRelation, OntologyClass,RelationType, Triple };
