const typescriptParser = require("typescript-parser");
const parser = new typescriptParser.TypescriptParser();

export interface ClassPropertyInterface {
    name: string;
    type: string; 
    start: number;
    end: number;
}

/**
 * 
 * @param {string} sourceString 
 */
function getDefaultValue(type: string): string  {
    switch( type ) {
        case 'string': return "DEFAULT_STRING_VALUE";
        case 'number': return "DEFAULT_NUMBER_VALUE";
        case 'array': return "DEFAULT_ARRAY_VALUE"; 
        default: return 'Object';
    }
}

function getDeclaration(atributeName: string, atributeType: string, atributeinitialize?: boolean ) {
    return `${atributeName}: ${atributeType} = new ${atributeType}() `;
}

function makeFunction(functionName: string, inputName: string, outputType: string, inputType: string, content: string): string {
    return `${functionName}(${inputName}: ${inputType}): ${outputType} { 
        ${content} }`;
}

function prettyAttributeInit(
    properties: ClassPropertyInterface[], 
    objectTargetName: string,
    objectSourceName: string,
    objectDefaultName: string) : string {
    const assignment: string[] = properties.map(
        (property: ClassPropertyInterface ) => {
            return `${objectSourceName}.${property.name}? ${objectTargetName}.${property.name} = ${objectSourceName}.${property.name} : ${objectTargetName}.${property.name} = ${objectDefaultName}.${property.name}`
        }
    );
    return assignment.join(";\n    ");
};

function getInstanceName( className: string ): string {
    return className[0].toLowerCase() + className.slice(1, className.length);
}

export async function extractAbstract( source: string ) : Promise<string> {
    const parsed = await parser.parseSource(source);
    
    const classDeclaration = parsed.declarations[0];
    let className: string = classDeclaration.name;
    let classPrefix: string = '';
    if ( className.indexOf('Interface') !== -1) {
        classPrefix = className.replace('Interface', '');
    } else {
        classPrefix = className;
    }
    //const classMethods = classDeclaration.methods;
    let classProperties: ClassPropertyInterface[] = classDeclaration.properties;
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
    let defaultObjectName = `${getInstanceName(classPrefix)}DefaultObject`;
    let newObjectName = getInstanceName(classPrefix);
    let sourceObjectName = getInstanceName(className);
    let prettyAssignments = prettyAttributeInit(classProperties, newObjectName,  sourceObjectName, defaultObjectName);
    let funct = "\n" + makeFunction('make', sourceObjectName, classPrefix, className , prettyAssignments  ) + "\n" ;
    const factory: string = "\n" +`export class ${classPrefix}Factory {
    ${funct}
    }`.trim();
    const defaultObject = `export const ${defaultObjectName}: ${className} = {
        ${prettyObjectProperties.join(",\n    ")}
        };`.trim();
        console.log(defaultObject);
    return defaultObject.concat("\n",  factory);
}
