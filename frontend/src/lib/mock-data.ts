export interface Message {
  id: string;
  sender: 'user' | 'agent';
  messages: string;
  timestamp: Date;
  sections?: {
    summary?: string;
    plan?: string;
    code?: string;
    log?: string;
  };
}

export const mockMessages: Message[] = [
  {
    id: '1',
    sender: 'user',
    messages: 'Fetch the top story from Hacker News and save its title to a file named hn_title.txt',
    timestamp: new Date(Date.now() - 300000), // 5 minutes ago
  },
  {
    id: '2',
    sender: 'agent',
    messages: 'I will help you fetch the top story from Hacker News and save its title to a file.',
    timestamp: new Date(Date.now() - 240000), // 4 minutes ago
    sections: {
      summary: 'Okay, I will fetch the top story from Hacker News and save its title to a file.',
      plan: `I will use the Hacker News API to fetch the current top story, extract its title, and save it to a file named hn_title.txt.

Here's my approach:
1. Make a request to the Hacker News API to get the top story ID
2. Fetch the story details using that ID
3. Extract the title from the response
4. Write the title to a file named hn_title.txt`,
      code: `I have generated the code to fetch the data. Here is the script:

\`\`\`python
import requests
import json

# Get top story ID from Hacker News API
response = requests.get('https://hacker-news.firebaseio.com/v0/topstories.json')
top_story_id = response.json()[0]

# Fetch story details
story_response = requests.get(f'https://hacker-news.firebaseio.com/v0/item/{top_story_id}.json')
story_data = story_response.json()

# Extract title
title = story_data['title']

# Save to file
with open('hn_title.txt', 'w', encoding='utf-8') as f:
    f.write(title)

print(f"Title saved: {title}")
\`\`\``,
      log: `The code executed successfully. Here's what happened:

✅ Connected to Hacker News API
✅ Fetched top story ID: 39847291
✅ Retrieved story details
✅ Extracted title: "Show HN: I built a tool to visualize Git repositories"
✅ Saved title to hn_title.txt

The file has been created successfully with the current top story title from Hacker News.`
    }
  }
];