async function testFetch() {
  const API_ES = 'https://ajphchgh0i.execute-api.us-west-2.amazonaws.com/dev/api';
  
  try {
    console.log('Testing Spanish API...');
    const response1 = await fetch(`${API_ES}/books/spa-RVR1960:Gen/verses/1`);
    const text1 = await response.text();
    const data1 = await response1.json();
    console.log('Spanish OK:', data1.length, 'verses');
  } catch (e: any) {
    console.error('Spanish Error:', e.message);
  }
}

testFetch();
