import {
    Message as VercelChatMessage,
    StreamingTextResponse,
    createStreamDataTransformer
} from 'ai';
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { HttpResponseOutputParser } from 'langchain/output_parsers';

import { JSONLoader } from "langchain/document_loaders/fs/json";
import { RunnableSequence } from '@langchain/core/runnables'
import { formatDocumentsAsString } from 'langchain/util/document';

const loader = new JSONLoader(
    "./src/data/dataset.json",
    ["/Allergies", "/Symptoms", "/Recommended Supplements", "/Additional Notes"],
);

export const dynamic = 'force-dynamic';

const formatMessage = (message: VercelChatMessage) => {
    return `${message.role}: ${message.content}`;
};

const TEMPLATE = `Answer the user's questions based only on the following context:
==============================
Context: {context}
==============================
Current conversation: {chat_history}

user: {question}
==============================
Please provide a detailed and accurate response based on the context above. If the context does not contain enough information to answer the question, indicate that more information is needed.
==============================
assistant:`;

export async function POST(req: Request) {
    try {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error("OPENAI_API_KEY is not set in environment variables");
        }

        const { messages } = await req.json();

        if (!messages || messages.length === 0) {
            return Response.json(
                { error: "Messages array is missing or empty" },
                { status: 400 }
            );
        }

        const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
        const currentMessageContent = messages[messages.length - 1].content;

        const docs = await loader.load();
        const prompt = PromptTemplate.fromTemplate(TEMPLATE);

        const model = new ChatOpenAI({
            apiKey: process.env.OPENAI_API_KEY!,
            model: 'gpt-4o-mini',
            temperature: 0,
            streaming: true,
            verbose: true,
        });

        const parser = new HttpResponseOutputParser();

        const chain = RunnableSequence.from([
            {
                question: (input) => input.question,
                chat_history: (input) => input.chat_history,
                context: () => formatDocumentsAsString(docs),
            },
            prompt,
            model,
            parser,
        ]);

        const stream = await chain.stream({
            chat_history: formattedPreviousMessages.join('\n'),
            question: currentMessageContent,
        });

        return new StreamingTextResponse(
            stream.pipeThrough(createStreamDataTransformer())
        );
    } catch (e: any) {
        console.error('API Route Error:', e);
        return Response.json(
            { error: "Internal Server Error", details: e.message },
            { status: e.status ?? 500 }
        );
    }
}
