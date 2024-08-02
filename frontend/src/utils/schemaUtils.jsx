import { TYPE_CONSTRAINTS } from './constants';

export const isJsonString = (str) => {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
};

export const generateJSON = (field) => {
    let fieldArgs = {};

    // Metadata
    if (field.optional) fieldArgs.optional = field.optional;
    if (field.description) fieldArgs.description = field.description;
    if (field.default !== undefined) fieldArgs.default = field.default;
    if (field.examples && field.examples.length > 0) fieldArgs.examples = field.examples;

    // Type constraints
    TYPE_CONSTRAINTS[field.type].forEach(constraint => {
        if (field[constraint] !== undefined) fieldArgs[constraint] = field[constraint];
    });

    let fieldType;
    if (['string', 'integer', 'decimal', 'boolean'].includes(field.type)) {
        fieldType = field.type;
    } else if (field.type === 'enum') {
        fieldType = { 'enums': field.enums };
    } else if (field.type === 'model') {
        fieldType = {
            name: field.name,
            fields: field.fields && Object.fromEntries(
                field.fields.map(f => [f.name, generateJSON(f)])
            )
        };
    } else if (field.type === 'annotated') {
        fieldType = {
            'type': field.fields && (
                (field.fields.length === 1)
                    ? generateJSON(field.fields[0])
                    : field.fields.map(generateJSON)
            )
        };
    } else if (field.type === 'list' || field.type === 'set') {
        fieldType = { 'array_type': field.type };
        if (field.fields && field.fields.length > 0) {
            fieldType.item_type = field.fields.length === 1
                ? generateJSON(field.fields[0])
                : field.fields.map(generateJSON);
        }
    } else if (field.type === 'dict') {
        fieldType = { key_type: null, value_type: null };
        if (field.fields) {
            const keyField = field.fields.find(f => f.name === 'key');
            const valueField = field.fields.find(f => f.name === 'value');
            if (keyField) fieldType.key_type = generateJSON(keyField);
            if (valueField) fieldType.value_type = generateJSON(valueField);
        }
    }

    if (Object.keys(fieldArgs).length === 0) {
        return fieldType;
    }
    return {
        type: field.type === 'annotated' ? fieldType.type : fieldType,
        ...fieldArgs
    };
};

export const generateSchemaJSON = (field) => {
    const fieldJSON = generateJSON(field);
    return (field.type === 'model') ? fieldJSON : {
        name: 'Schema',
        fields: {
            [field.name || 'field']: fieldJSON
        }
    }
}

export const convertJSONToField = (inputJSON) => {
    let field = {
        id: Date.now().toString() + Math.random(),
    };
    if (inputJSON.name !== undefined) field.name = inputJSON.name;
    if (inputJSON.optional !== undefined) field.optional = inputJSON.optional;
    if (inputJSON.description !== undefined) field.description = inputJSON.description;
    if (inputJSON.default !== undefined) field.default = inputJSON.default;
    if (inputJSON.examples && inputJSON.examples.length > 0) field.examples = inputJSON.examples;

    let typeToCheck = inputJSON;
    if (typeToCheck.type) {
        if (Array.isArray(typeToCheck.type) || (typeToCheck.type.type !== undefined)) {
            field.type = "annotated";
            field.fields = (Array.isArray(typeToCheck.type)) ? typeToCheck.type.map(convertJSONToField) : [convertJSONToField(typeToCheck.type)];
            return field;
        }
        else {
            typeToCheck = typeToCheck.type;  // metadata and constraints are pushed down to the inner type
        }
    }

    if (typeof typeToCheck === 'string' && ['string', 'integer', 'decimal', 'boolean'].includes(typeToCheck)) {
        field.type = typeToCheck;
    }
    else if (typeToCheck.enums !== undefined) {
        field.type = 'enum';
        field.enums = typeToCheck.enums || [];
    }
    else if (typeToCheck.name !== undefined && typeToCheck.fields !== undefined) {
        field.type = 'model';
        field.fields = Object.entries(typeToCheck.fields).map(([name, field]) => convertJSONToField(wrapFieldData(field, name)));
    }
    else if (typeToCheck.array_type !== undefined && ['list', 'set'].includes(typeToCheck.array_type)) {
        field.type = typeToCheck.array_type;
        if (typeToCheck.item_type !== undefined) {
            field.fields = Array.isArray(typeToCheck.item_type)
                ? typeToCheck.item_type.map(convertJSONToField)
                : [convertJSONToField(typeToCheck.item_type)];
        }
    }
    else if (typeToCheck.key_type !== undefined || typeToCheck.value_type !== undefined) {
        field.type = 'dict';
        field.fields = [];
        if (typeToCheck.key_type !== undefined) {
            field.fields.push(convertJSONToField(wrapFieldData(typeToCheck.key_type, 'key')));
        }
        if (typeToCheck.value_type !== undefined) {
            field.fields.push(convertJSONToField(wrapFieldData(typeToCheck.value_type, 'value')));
        }
    }
    else {
        throw new Error(`Unknown type: ${JSON.stringify(typeToCheck)}`);
    }

    TYPE_CONSTRAINTS[field.type].forEach(constraint => {
        if (inputJSON[constraint] !== undefined) field[constraint] = inputJSON[constraint];
    });

    return field;
};

// Helper function to wrap new field data with name correctly
const wrapFieldData = (field, name) => {
    if (typeof field === 'string') {
        return { type: field, name };
    } else if (Array.isArray(field)) {
        return { type: field, name };
    } else if (typeof field === 'object') {
        return { ...field, name };
    }
    throw new Error(`Invalid field data: ${JSON.stringify(field)}`);
};