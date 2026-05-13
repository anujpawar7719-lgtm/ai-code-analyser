import * as babelParser from '@babel/parser';

/**
 * Parses files to extract imports, exports, functions, and classes.
 */
export const parseFiles = (files) => {
  return files.map(file => {
    try {
      if (file.language === 'javascript' || file.language === 'typescript') {
        return {
          path: file.path,
          ...parseJsTs(file.content, file.path),
          loc: file.content.split('\n').length
        };
      } else if (file.language === 'python') {
        return {
          path: file.path,
          ...parsePython(file.content),
          loc: file.content.split('\n').length
        };
      } else if (file.path.endsWith('package.json')) {
        return {
          path: file.path,
          ...parsePackageJson(file.content),
          loc: file.content.split('\n').length
        };
      }
      
      // Fallback for other languages
      return {
        path: file.path,
        imports: [],
        exports: [],
        functions: [],
        classes: [],
        loc: file.content.split('\n').length
      };
    } catch (error) {
      console.warn(`Failed to parse ${file.path}:`, error.message);
      return {
        path: file.path,
        imports: [],
        exports: [],
        functions: [],
        classes: [],
        loc: file.content.split('\n').length,
        error: error.message
      };
    }
  });
};

const parseJsTs = (content, path) => {
  const isTs = path.endsWith('.ts') || path.endsWith('.tsx');
  const plugins = ['jsx', 'decorators-legacy', 'classProperties', 'topLevelAwait'];
  if (isTs) plugins.push('typescript');

  const ast = babelParser.parse(content, {
    sourceType: 'module',
    plugins
  });

  const imports = [];
  const exports = [];
  const functions = [];
  const classes = [];

  const traverse = (node) => {
    if (!node) return;

    // Imports
    if (node.type === 'ImportDeclaration') {
      imports.push(node.source.value);
    } else if (node.type === 'CallExpression' && node.callee.name === 'require') {
      if (node.arguments[0]?.type === 'StringLiteral') {
        imports.push(node.arguments[0].value);
      }
    }

    // Exports
    if (node.type === 'ExportNamedDeclaration' || node.type === 'ExportDefaultDeclaration') {
      exports.push('default'); // Simplified
    }

    // Functions
    if (node.type === 'FunctionDeclaration' && node.id) {
      functions.push(node.id.name);
    } else if (node.type === 'VariableDeclaration') {
      node.declarations.forEach(decl => {
        if (decl.init?.type === 'ArrowFunctionExpression' || decl.init?.type === 'FunctionExpression') {
          if (decl.id.type === 'Identifier') functions.push(decl.id.name);
        }
      });
    }

    // Classes
    if (node.type === 'ClassDeclaration' && node.id) {
      classes.push(node.id.name);
    }

    // Recurse
    for (const key in node) {
      if (node[key] && typeof node[key] === 'object') {
        if (Array.isArray(node[key])) {
          node[key].forEach(traverse);
        } else {
          traverse(node[key]);
        }
      }
    }
  };

  traverse(ast.program);

  return { imports, exports, functions, classes };
};

const parsePython = (content) => {
  const imports = [];
  const functions = [];
  const classes = [];

  // Simple regex for Python
  const importRegex = /^(?:from\s+(\S+)\s+import|import\s+(\S+))/gm;
  const funcRegex = /^def\s+(\w+)/gm;
  const classRegex = /^class\s+(\w+)/gm;

  let match;
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1] || match[2]);
  }
  while ((match = funcRegex.exec(content)) !== null) {
    functions.push(match[1]);
  }
  while ((match = classRegex.exec(content)) !== null) {
    classes.push(match[1]);
  }

  return { imports, exports: [], functions, classes };
};

const parsePackageJson = (content) => {
  try {
    const pkg = JSON.parse(content);
    const deps = [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.devDependencies || {})];
    return {
      imports: deps,
      exports: [],
      functions: Object.keys(pkg.scripts || {}),
      classes: [],
      metadata: {
        name: pkg.name,
        version: pkg.version,
        description: pkg.description
      }
    };
  } catch (e) {
    return { imports: [], exports: [], functions: [], classes: [] };
  }
};
