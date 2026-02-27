const fs = require('fs');

// We have to mock export because the file uses ES6 "export const" syntax
const code = fs.readFileSync('./FrontEnd/frontend/src/utils/latexParser.js', 'utf8');
const executableCode = code.replace('export const parseLatexToResumeData', 'const parseLatexToResumeData');

eval(executableCode + `

const latexRaw = \`
\\textbf{\\uppercase{John Doe}} \\\\
\\vspace{2pt}
123-456-7890 $|$ john@email.com $|$ \\href{https://linkedin.com/in/johndoe}{LinkedIn}
\\end{center}

\\section*{Experience}
\\textbf{Software Engineer} \\hfill Jan 2020 - Present \\\\
\\textit{Tech Corp} \\\\
\\begin{itemize}
\\item Built cool stuff.
\\end{itemize}
\`;

try {
  console.log(JSON.stringify(parseLatexToResumeData(latexRaw), 2, 2));
} catch(e) {
  console.error("Failed", e);
}

`);
