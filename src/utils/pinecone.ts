import { Pinecone, ScoredVector } from "@pinecone-database/pinecone";

let pinecone: Pinecone | null = null;

export const getPinecone = () => {
  if (!pinecone) {
    pinecone = new Pinecone({
      environment: process.env.PINECONE_ENVIRONMENT!,
      apiKey: process.env.PINECONE_API_KEY!,
    })
  }
  return pinecone
}

export const getPineconeIndex = () => {
  const pinecone = getPinecone()
  // console.log('PINECONE_INDEX_NAME', process.env.PINECONE_INDEX)
  return pinecone && pinecone.Index(process.env.PINECONE_INDEX!)
}