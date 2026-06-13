import axios from 'axios';

async function runTest() {
  const payload = {
    githubUrl: 'https://github.com/expressjs/express'
  };

  console.log('⏳ Sending analysis request to local backend on port 5000...');
  console.log(`Repository: ${payload.githubUrl}`);

  try {
    const response = await axios.post('http://localhost:5000/api/analyze', payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 60000 // 60 seconds because AI analysis takes a bit of time
    });

    console.log('\n🟢 Response received successfully!');
    console.log('Status Code:', response.status);
    console.log('\n--- DATA EXTRACTED ---');
    console.log('Name:', response.data.data.repoInfo.fullName);
    console.log('Description:', response.data.data.repoInfo.description);
    console.log('Languages:', Object.keys(response.data.data.repoInfo.languages).join(', '));
    
    console.log('\n--- AI ANALYSIS SUMMARY ---');
    console.log('Summary:', response.data.data.analysis.projectSummary);
    console.log('Beginner Friendly:', response.data.data.analysis.beginnerFriendly);
    console.log('Tech Badges:', response.data.data.analysis.detectedTechBadges.join(', '));
    console.log('Scores:', response.data.data.analysis.scores);
    
    console.log('\n✅ Integration test passed!');
  } catch (error) {
    console.error('\n🔴 Integration test failed!');
    if (error.response) {
      console.error('Status Code:', error.response.status);
      console.error('Error Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Message:', error.message);
    }
  }
}

runTest();
