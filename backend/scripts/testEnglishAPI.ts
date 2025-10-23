const API_EN = 'https://bible-api.com';

async function testAPI() {
  try {
    const url = `${API_EN}/Genesis+1?translation=kjv`;
    console.log('Fetching:', url);
    
    const response = await fetch(url);
    console.log('Status:', response.status);
    console.log('Content-Type:', response.headers.get('content-type'));
    
    const text = await response.text();
    console.log('Response length:', text.length);
    console.log('First 200 chars:', text.substring(0, 200));
    
    try {
      const data = JSON.parse(text);
      console.log('\nJSON parsed successfully!');
      console.log('Verses count:', data.verses.length);
      console.log('First verse:', data.verses[0]);
    } catch (jsonError: any) {
      console.error('\nJSON parse error:', jsonError.message);
      console.log('Last 100 chars:', text.substring(text.length - 100));
    }
  } catch (error: any) {
    console.error('Fetch error:', error.message);
  }
}

testAPI();
