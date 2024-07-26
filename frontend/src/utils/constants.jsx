// constants.js

// Field types
export const FIELD_TYPES = [
    'model',
    'string',
    'integer',
    'decimal',
    'boolean',
    'enum',
    'list',
    'set',
    'annotated',
];

// Sequence constraints
export const SEQUENCE_CONSTRAINTS = [
    'min_length',
    'max_length',
];

// String constraints
export const STRING_CONSTRAINTS = [
    'pattern'
];

// Numeric constraints (for both integer and decimal)
export const NUMERIC_CONSTRAINTS = [
    'gt',
    'ge',
    'lt',
    'le',
    'multiple_of'
];

// Additional decimal constraints
export const DECIMAL_CONSTRAINTS = [
    'allow_inf_nan',
    'max_digits',
    'decimal_places'
];

export const TYPE_CONSTRAINTS = {
    string: [...SEQUENCE_CONSTRAINTS, ...STRING_CONSTRAINTS],
    integer: NUMERIC_CONSTRAINTS,
    decimal: [...NUMERIC_CONSTRAINTS, ...DECIMAL_CONSTRAINTS],
    boolean: [],
    enum: [],
    list: SEQUENCE_CONSTRAINTS,
    set: SEQUENCE_CONSTRAINTS,
    annotated: [],
    model: []
};

// API endpoint (placeholder)
export const API_ENDPOINT = import.meta.env.VITE_API_URL;

// Maximum length for code truncation
export const MAX_CODE_LINE_LENGTH = 200;

// Chat roles
export const CHAT_ROLES = {
    USER: 'user',
    ASSISTANT: 'assistant'
};

// Button variants
export const BUTTON_VARIANTS = {
    DEFAULT: 'default',
    DESTRUCTIVE: 'destructive',
    OUTLINE: 'outline',
    SECONDARY: 'secondary',
    GHOST: 'ghost',
    LINK: 'link'
};

// Button sizes
export const BUTTON_SIZES = {
    DEFAULT: 'default',
    SM: 'sm',
    LG: 'lg',
    ICON: 'icon'
};

// Timeout durations
export const TIMEOUTS = {
    COPY_FEEDBACK: 2000 // 2 seconds
};

// Default field properties
export const DEFAULT_FIELD = {
    name: '',
    type: 'string',
    optional: false,
    fields: [],
    enums: []
};

// Import dialog placeholder text
export const IMPORT_DIALOG_PLACEHOLDER = 'Paste your JSON schema here...';

// Model options
export const MODEL_OPTIONS = ['claude-3-5-sonnet-20240620', 'gpt-4o', 'gpt-4o-mini', 'groq/llama-3.1-70b-versatile', 'groq/llama-3.1-8b-instant', 'gemini/gemini-1.5-pro-latest', 'gemini/gemini-1.5-flash', 'Custom Model'];

// Default model settings
export const DEFAULT_MODEL_SETTINGS = {
    model: 'gemini/gemini-1.5-flash',
    temperature: 0,
    max_tokens: 4096,
    max_attempts: 3,
    apiKey: ''
};
