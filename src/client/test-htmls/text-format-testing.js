function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
    "\n": "<br>",
    " ": "&nbsp;",
  };
  return text.replace(/[&<>"'\n ]/g, function (m) {
    return map[m];
  });
}

function formatTextForHtml(text) {
  // Split text into lines
  const lines = text.split("\n");
  let formattedText = "";

  lines.forEach((line) => {
    if (line.startsWith("```")) {
      // Handle code block
      if (formattedText.endsWith("</pre><code>")) {
        // End of code block
        formattedText += "</code></pre>";
      } else {
        // Start of code block
        formattedText += "<pre><code>";
      }
    } else {
      formattedText += escapeHtml(line) + "<br>";
    }
  });

  return formattedText;
}

// Example usage
const rawText = `This is a sample text with a code snippet:\n\`\`\`\nconsole.log('Hello, world!');\n\`\`\`\nAnd some more text.`;
const formattedText = formatTextForHtml(rawText);
document.getElementById("output").innerHTML = formattedText;
