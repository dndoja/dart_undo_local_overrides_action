const core = require('@actions/core');
const fs = require('fs');

try {
    const path = core.getInput('pubspec-path');

    fs.readFile(path, 'utf8', (err, data) => {
        if (err) core.setFailed(err.message)
        if (!data) core.setFailed('pubspec.yaml not found!')

        const lines = data.split('\n')
        const overridesIndex = lines.indexOf('dependency_overrides:')
        const overridesEnd = lines.indexOf('', overridesIndex)
        let commentedLines = 0

        for (var i = overridesIndex + 1; i < overridesEnd; i++) {
            const previous = lines[i - 1]
            const current = lines[i]
            const isPath = current.match('^    path:')
            if (isPath) {
                lines[i - 1] = commentOut(previous)
                lines[i] = commentOut(current)
                commentedLines += 2
            }
        }

        if (commentedLines == overridesEnd - overridesIndex - 1) {
            lines[overridesIndex] = commentOut(lines[overridesIndex])
        }
        
        console.log(`Commented out ${commentedLines / 2} dependency overrides.`)

        fs.writeFile(path, lines.join('\n'), (_, __) => { })
    });
} catch (error) {
    core.setFailed(error.message);
}

function commentOut(line) {
    if (line.includes('#')) return line;

    const initialLength = line.length;
    const trimmed = line.trimStart();
    let commented = '';
    const noSpaces = initialLength - trimmed.length;

    for (let i = 0; i < noSpaces; i++) {
        commented = commented.concat(' ')
    }

    commented = commented.concat('# ').concat(trimmed)

    return commented;
}