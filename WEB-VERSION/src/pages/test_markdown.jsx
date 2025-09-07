import React from 'react';
import MarkdownRenderer from '../components/MarkdownRenderer_fixed';

const TestMarkdown = () => {
  const testContent = `
# Test Heading

This is a test paragraph with **bold text** and *italic text*.

Here's a list:
1. **First item** with bold
2. *Second item* with italic
3. Normal text item

## Subheading

Here's more text with **bold** and *italic* formatting.

\`\`\`javascript
// Test code block
const test = "hello world";
console.log(test);
\`\`\`

And some inline \`code\` here.
`;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Markdown Test</h1>
      
      <div style={{ marginBottom: '30px' }}>
        <h3>Raw Content:</h3>
        <pre style={{ 
          background: '#f5f5f5', 
          padding: '10px', 
          borderRadius: '4px',
          fontSize: '12px',
          overflow: 'auto'
        }}>
          {testContent}
        </pre>
      </div>
      
      <div>
        <h3>Rendered Content:</h3>
        <div style={{ 
          border: '1px solid #ddd', 
          padding: '20px', 
          borderRadius: '4px',
          background: '#fff'
        }}>
          <MarkdownRenderer content={testContent} theme="light" />
        </div>
      </div>
    </div>
  );
};

export default TestMarkdown; 