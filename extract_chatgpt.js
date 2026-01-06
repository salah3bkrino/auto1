import ZAI from 'z-ai-web-dev-sdk';

async function extractChatGPTContent() {
  try {
    const zai = await ZAI.create();
    
    const result = await zai.functions.invoke('page_reader', {
      url: 'https://chatgpt.com/share/6952ef50-9278-8006-9f58-f27d388ad6ae'
    });

    console.log('Title:', result.data.title);
    console.log('URL:', result.data.url);
    console.log('Content length:', result.data.html.length);
    console.log('Published time:', result.data.publishedTime);
    console.log('--- CONTENT ---');
    console.log(result.data.html);
    
    return result.data;
  } catch (error) {
    console.error('Failed to extract content:', error.message);
    throw error;
  }
}

extractChatGPTContent();