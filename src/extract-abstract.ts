const typescriptParser = require("typescript-parser")
const parser = new typescriptParser.TypescriptParser();

/**
 * 
 * @param {string} sourceString 
 */
function getDefaultValue(type: string): string  {
    switch( type ) {
        case 'string': return "''";
        case 'number': return "-12";
        case 'array': return "[]"; 
        default: return 'Object';
    }
}
export async function extractAbstract( source: string ) : Promise<string> {
    const parsed = await parser.parseSource(source);

    const classDeclaration = parsed.declarations.filter((declaration : any) => declaration instanceof typescriptParser.ClassDeclaration)[0];
    let className: string = classDeclaration.name;
    let classPrefix: string = '';
    if ( className.indexOf('Interface') !== -1) {
        classPrefix = className.replace('Interface', '');
    } else {
        classPrefix = className;
    }
    //const classMethods = classDeclaration.methods;
    let classProperties = classDeclaration.properties;
    console.log(classDeclaration.properties);
/**
 * Class propertie:
 * object (name:string, type: string, start: number, end: number)
 */
    let prettyObjectProperties = classProperties.map(
        (property: {name: string, type: string, start: number, end: number} )=> {
            return property.name + ' : ' + getDefaultValue(property.type)
        }
    );
    let prettyAbstractProperties = classProperties.map(
        (property: {name: string, type: string, start: number, end: number} )=> {
            return property.name + ' : any' 
        }
    );
    const abstractClass: string = "\n" +`export abstract class ${classPrefix}Abstract {
    ${prettyAbstractProperties.join(";\n    ").concat(";")}
    }`.trim();
    const defaultObject = `export const ${classPrefix.toLowerCase()}DefaultObject: ${className} = {
        ${prettyObjectProperties.join(",\n    ")}
        };`.trim();
        console.log(defaultObject);
    return abstractClass.concat("\n",  defaultObject);
}
