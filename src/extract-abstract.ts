const typescriptParser = require("typescript-parser")
const parser = new typescriptParser.TypescriptParser();

/**
 * 
 * @param {string} sourceString 
 */
export async function extractAbstract( source: string ) {
    const parsed = await parser.parseSource(source);

    const classDeclaration = parsed.declarations.filter(declaration => declaration instanceof typescriptParser.ClassDeclaration)[0];
    let className: string = classDeclaration.name;
    if ( className.indexOf('Interface') !== -1) {
        className = className.replace('Interface', '');
    }
    //const classMethods = classDeclaration.methods;
    let classProperties = classDeclaration.properties;
    console.log(classDeclaration.properties);
/**
 * Class propertie:
 * object (name:string, type: string, start: number, end: number)
 */
    let pretty = classProperties.map(
        (property: {name: string, type: string, start: number, end: number} )=> {
            return property.name + ' : ' + 'any'
        }
    )

    const res = `export abstract class ${className}Abstract {
    ${pretty.join(";\n    ").concat(";")}
    }`.trim();

    return res;
}
