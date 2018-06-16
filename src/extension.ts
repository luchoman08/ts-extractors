'use strict';

import { extractAbstract } from "./extract-abstract";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
export function bindMenuToFunctions(){
    if (!vscode.window.activeTextEditor) {
        vscode.window.showInformationMessage('Open a file first to manipulate text selections');
        return;
    }

    let items = [];

    const description = "Extract factory, interface, default object and class from abstract class";
    items.push({ label: "Extract all", description });
    return vscode.window.showQuickPick(items).then(selection => {
        if (!selection) {
            return;
        }

        const editor = vscode.window.activeTextEditor;
        if ( typeof editor === "undefined" ) {
            vscode.window.showInformationMessage('Editor is undefined');
            return  new Promise<string>((resolve) => {
                resolve('Editor is undefined');
            });;
        }
        const selections = editor.selections;
        const text = editor.document.getText(selections[0])

        return extractAbstract(text);

    });
        
}

export function bindExtensionToEditor() {
    
    var editor = vscode.window.activeTextEditor;
    if ( typeof editor === "undefined" ) {
        vscode.window.showInformationMessage('Editor is undefined');
        return 0;
    }
    const  document  = editor.document;
  
    const selectionLine = editor.selection.end.line;
    
    console.log(selectionLine)
    const lastLine = document.lineAt(selectionLine);

    const edit = new vscode.WorkspaceEdit();
    let response = bindMenuToFunctions();
    if ( typeof response === 'undefined' ) {
        return 0;
    }
    response.then( res  => {
        if ( typeof res === 'undefined' ) {
            return false;
        }
        console.log(res);
        edit.insert(document.uri, lastLine.range.end, res as any );
        vscode.window.showInformationMessage('All extractors has been executed correctly');
        return vscode.workspace.applyEdit(edit)
    });


}



// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Extension "Extractors Ts" is loaded');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.extract', () => {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        bindExtensionToEditor();
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}