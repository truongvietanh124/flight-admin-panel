import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
// Import plugin typescript-eslint
import tseslint from '@typescript-eslint/eslint-plugin';

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    ...compat.extends("next/core-web-vitals"),

    {
        // Khai báo plugin ở đây
        plugins: {
            '@typescript-eslint': tseslint,
        },
        rules: {
            // Bây giờ ESLint mới biết quy tắc này thuộc plugin nào
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-unused-vars": [
                "warn",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                }
            ],
            // ... các quy tắc khác nếu có
        }
    }
];

export default eslintConfig;