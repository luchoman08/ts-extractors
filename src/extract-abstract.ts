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

function getDeclaration(atributeName: string, atributeType: string ) {
    return `let ${atributeName}: ${atributeType} = new ${atributeType}(); `;
}

function makeFunction(
    functionName: string, 
    inputName: string, 
    outputType: string, 
    inputType: string, 
    content: string,
    newObjectName: string): string {
    return `${functionName}(${inputName}: ${inputType}): ${outputType} {
        ${getDeclaration(newObjectName, outputType)}
        ${content} 
        ${getReturn(newObjectName)}}`;
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

function getReturn( objectName: string ): string {
    return `return ${objectName}`;
}

function getClassExtends( className: string, baseClass: string): string {
    return `export class ${className} extends ${baseClass} {}`;
}
function getInterfaceExtends( interfaceName: string, baseClass: string): string {
    return `export interface ${interfaceName} extends ${baseClass} {}`;
}
export async function extractAbstract( source: string ) : Promise<string> {
    const parsed = await parser.parseSource(source);
    const classDeclaration = parsed.declarations[0];
    let className: string = classDeclaration.name;
    let classPrefix: string = '';
    if ( className.indexOf('Abstract') !== -1) {
        classPrefix = className.replace('Abstract', '');
    } else {
        classPrefix = className;
    }
    let defaultObjectName = `${getInstanceName(classPrefix)}DefaultObject`;
    let newObjectName = getInstanceName(classPrefix);
    let sourceObjectName = getInstanceName(className);
    let interfaceName: string =  classPrefix + 'Interface';
    let classProperties: ClassPropertyInterface[] = classDeclaration.properties;
    let prettyObjectProperties = classProperties.map(
        (property: {name: string, type: string, start: number, end: number} )=> {
            return property.name + ' : ' + getDefaultValue(property.type)
        }
    );
    let prettyAssignments = prettyAttributeInit(classProperties, newObjectName,  sourceObjectName, defaultObjectName);
    let funct = "\n" + makeFunction('make', sourceObjectName, classPrefix, className , prettyAssignments, newObjectName  ) + "\n" ;
    const factory: string = "\n" +`export class ${classPrefix}Factory {
    ${funct}
    }`.trim();
    let interfaceDefinition: string = getInterfaceExtends(interfaceName, className);
    let classDefinition: string = getClassExtends(classPrefix, className);
    const defaultObject = `export const ${defaultObjectName}: ${interfaceName} = {
        ${prettyObjectProperties.join(",\n    ")}
        };`.trim();
    return defaultObject.concat("\n", interfaceDefinition, "\n", classDefinition, "\n", factory);
}
