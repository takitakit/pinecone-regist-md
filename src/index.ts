import fs from 'fs/promises'
import path from 'path'

// import { PineconeClient, ScoredVector } from "@pinecone-database/pinecone";
import { Document, MarkdownTextSplitter } from "@pinecone-database/doc-splitter"
import { utils as PineconeUtils, Vector, PineconeRecord, RecordMetadata } from "@pinecone-database/pinecone";
import { truncateStringByBytes } from "./utils/truncateString"
import md5 from "md5"
import { getPineconeIndex } from "./utils/pinecone"
import { getEmbeddings } from "./utils/embeddings"

async function seed () {

  const dirPath = path.join(process.cwd(), 'articles')
  const fileNames = (await fs.readdir(dirPath)).filter(filename => path.extname(filename) === '.md')

  const splitter = new MarkdownTextSplitter({})
  const index = getPineconeIndex()

  for (const fileName of fileNames) {
    const filePath = path.join(dirPath, fileName)
    const content = await fs.readFile(filePath, 'utf8')

    const documents = await prepareDocument(content, splitter)
    const vectors = await Promise.all(documents.flat().map(embedDocument))
    await index.upsert(vectors)
  }
}


// MDファイルを適切なChunkに分割してPinecone Documentの配列を作成する
async function prepareDocument(mdContent: string, splitter: MarkdownTextSplitter): Promise<Document[]> {

  // Split the documents using the provided splitter
  const docs = await splitter.splitDocuments([
    new Document({
      pageContent: mdContent,
      metadata: {
        // Truncate the text to a maximum byte length
        text: truncateStringByBytes(mdContent, 36000)
      },
    }),
  ])

  // Map over the documents and add a hash to their metadata
  return docs.map((doc: Document) => {
    return {
      pageContent: doc.pageContent,
      metadata: {
        ...doc.metadata,
        // Create a hash of the document content
        hash: md5(doc.pageContent)
      },
    }
  })
}

// Pinecone Documentをベクトル化する
async function embedDocument(doc: Document): Promise<PineconeRecord<RecordMetadata>> {
  try {
    // Generate OpenAI embeddings for the document content
    const embedding = await getEmbeddings(doc.pageContent);

    // Create a hash of the document content
    const hash = md5(doc.pageContent);

    // Return the vector embedding object
    return {
      id: hash, // The ID of the vector is the hash of the document content
      values: embedding, // The vector values are the OpenAI embeddings
      metadata: { // The metadata includes details about the document
        chunk: doc.pageContent, // The chunk of text that the vector represents
        text: doc.metadata.text as string, // The text of the document
        hash: doc.metadata.hash as string // The hash of the document content
      }
    } as PineconeRecord<RecordMetadata>;
  } catch (error) {
    console.log("Error embedding document: ", error)
    throw error
  }
}

seed()