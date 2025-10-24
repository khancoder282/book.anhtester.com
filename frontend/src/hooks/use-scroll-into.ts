// import { useEffect } from 'react';

// import { scrollIntoView } from 'src/utils/scrollInto';

// export const useScrollToError = (options: { offset?: number, setFocus?: (name: string) => void } = {}) => {
//     // const { formState: { errors }, setFocus } = useFormContext();
//     const { offset = -100, setFocus } = options; // Offset mặc định: scroll lên 100px để tránh che
//     const

//     useEffect(() => {
//         const firstErrorField = Object.keys(errors)[0] as keyof typeof errors;

//         if (firstErrorField && errors[firstErrorField]) {
//             // Focus vào trường lỗi đầu tiên
//             setFocus(firstErrorField as any);

//             // Scroll đến trường đó sau một delay ngắn để focus hoạt động
//             setTimeout(() => {
//                 const element = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
//                 if (element) {
//                     scrollIntoView(element, { offset });
//                 }
//             }, 100);
//         }
//     }, [errors, setFocus, offset]); // Re-run khi errors thay đổi
// };