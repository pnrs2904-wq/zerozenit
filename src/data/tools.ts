import type { Tool } from '@/types';
import cmsTools from './tools-cms.json';

const baseTools: Tool[] = [
  {
    slug: 'claude',
    name: 'Claude',
    logo: '✳️',
    description: 'A capable AI assistant for writing, analysis, and coding with long context.',
    category: 'Writing',
    pricing: 'Freemium',
    url: 'https://claude.ai',
    rating: 4.8,
    features: ['Long context', 'Coding', 'Analysis', 'Artifacts'],
    pros: ['Strong reasoning', 'Careful, nuanced tone'],
    cons: ['Usage limits on free tier'],
  },
  {
    slug: 'notion-ai',
    name: 'Notion AI',
    logo: '📝',
    description: 'AI writing and summarizing built into the Notion workspace.',
    category: 'Productivity',
    pricing: 'Paid',
    url: 'https://notion.so',
    rating: 4.4,
    features: ['In-doc writing', 'Summaries', 'Q&A over workspace'],
    pros: ['Lives where you work', 'Good summaries'],
    cons: ['Requires Notion', 'Add-on cost'],
  },
  {
    slug: 'perplexity',
    name: 'Perplexity',
    logo: '🔎',
    description: 'An answer engine that cites live web sources for research questions.',
    category: 'Research',
    pricing: 'Freemium',
    url: 'https://perplexity.ai',
    rating: 4.5,
    features: ['Cited answers', 'Live web', 'Focus modes'],
    pros: ['Transparent sources', 'Fast'],
    cons: ['Depth varies by topic'],
  },
  {
    slug: 'raycast-ai',
    name: 'Raycast AI',
    logo: '⚡',
    description: 'AI actions and chat from a fast macOS launcher.',
    category: 'Productivity',
    pricing: 'Freemium',
    url: 'https://raycast.com',
    rating: 4.6,
    features: ['Keyboard-first', 'Quick AI', 'Extensions'],
    pros: ['Very fast', 'Deep macOS integration'],
    cons: ['macOS only'],
  },
  {
    slug: 'elevenlabs',
    name: 'ElevenLabs',
    logo: '🔊',
    description: 'Natural text-to-speech and voice cloning for creators.',
    category: 'Audio',
    pricing: 'Freemium',
    url: 'https://elevenlabs.io',
    rating: 4.5,
    features: ['TTS', 'Voice cloning', 'Dubbing'],
    pros: ['High realism', 'Many languages'],
    cons: ['Credits run out quickly'],
  },
];

export function getTool(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}

export const tools: Tool[] = [...baseTools, ...(cmsTools as Tool[])];
