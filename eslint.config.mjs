import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    // Kế thừa các cấu hình gốc từ Next.js
    ...compat.extends("next/core-web-vitals"), // Thường thì cái này đã đủ cho cả TS

    // Thêm đối tượng này để ghi đè hoặc cấu hình thêm các quy tắc
    {
        rules: {
            // Ví dụ: Chuyển lỗi 'no-explicit-any' thành cảnh báo (warning)
            "@typescript-eslint/no-explicit-any": "warn",

            // Ví dụ: Chuyển lỗi 'no-unused-vars' thành cảnh báo (warning)
            "@typescript-eslint/no-unused-vars": [
                "warn", // Mức độ: "warn" hoặc "off" để tắt hẳn
                {
                    argsIgnorePattern: "^_", // Vẫn bỏ qua biến bắt đầu bằng '_'
                    varsIgnorePattern: "^_", // Vẫn bỏ qua biến bắt đầu bằng '_'
                }
            ],

            // Bạn có thể thêm các quy tắc tùy chỉnh khác ở đây
        }
    }
];

export default eslintConfig;