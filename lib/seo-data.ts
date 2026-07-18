export interface ToolSEOData {
  longDescription: string;
  howTo: { step: string; description: string }[];
  faqs: { question: string; answer: string }[];
}

export const SEO_DATA: Record<string, ToolSEOData> = {
  "remove-bg": {
    longDescription: "Our free AI Background Remover uses advanced machine learning (RMBG 2.0) to instantly detect subjects and erase backgrounds with pixel-perfect precision. Whether you are dealing with complex hair, transparent objects, or detailed product photography, this tool processes images securely in your browser and delivers high-quality transparent PNGs in seconds. Perfect for e-commerce, graphic design, and social media content creation.",
    howTo: [
      { step: "Upload Image", description: "Click the upload area or drag and drop your JPG, PNG, or WebP image into the tool." },
      { step: "AI Processing", description: "Our AI automatically detects the main subject and separates it from the background in seconds." },
      { step: "Download Result", description: "Click the download button to instantly save your new transparent PNG image to your device." }
    ],
    faqs: [
      { question: "Is the background remover completely free?", answer: "Yes, you can remove backgrounds from your images for free using our daily credit allocation. No credit card is required." },
      { question: "What image formats are supported?", answer: "We currently support JPG, JPEG, PNG, and WebP image formats." },
      { question: "Are my images stored on your servers?", answer: "We take your privacy seriously. Images are processed securely and automatically deleted from our servers shortly after processing." },
      { question: "Can it handle complex edges like hair or fur?", answer: "Yes! Our advanced AI model is specifically trained to accurately cutout complex edges, including human hair, animal fur, and transparent objects." }
    ]
  },
  
  "essay-writer": {
    longDescription: "Struggling with writer's block? Our AI Essay Writer helps students, professionals, and creatives generate well-structured, high-quality essays on any topic. Powered by advanced language models, it can write argumentative, persuasive, or analytical essays complete with an introduction, thesis statement, body paragraphs, and a strong conclusion. It's the perfect tool to outline your thoughts and accelerate your writing process.",
    howTo: [
      { step: "Enter Your Topic", description: "Type in the subject or specific prompt for your essay in the text box." },
      { step: "Set Parameters (Optional)", description: "Specify the tone or length you want the AI to aim for." },
      { step: "Generate & Edit", description: "Click generate. Within seconds, you'll receive a structured draft that you can copy, edit, and refine." }
    ],
    faqs: [
      { question: "Can the AI write a persuasive essay?", answer: "Yes. By specifying 'persuasive' in your prompt, the AI will structure the essay to include a strong thesis, supporting arguments, and a compelling conclusion." },
      { question: "Will the generated essay pass plagiarism checkers?", answer: "The AI generates unique text based on patterns it has learned, meaning it is typically free of direct plagiarism. However, we always recommend using the generated text as a draft or inspiration and editing it to reflect your own voice." },
      { question: "Is there a word limit for the generated essay?", answer: "The tool is optimized to generate essays up to approximately 700 words to maintain high quality and coherence." }
    ]
  },

  "pdf-merge": {
    longDescription: "The ToolNode PDF Merger is the fastest and most secure way to combine multiple PDF documents into a single file. Unlike other tools that upload your sensitive documents to remote servers, our PDF merger processes everything entirely in your web browser. This means your personal and business documents never leave your device, ensuring 100% privacy and zero risk of data leaks.",
    howTo: [
      { step: "Select Files", description: "Click the upload button or drag and drop all the PDF files you want to combine." },
      { step: "Reorder Pages", description: "Once loaded, drag the files up or down in the list to arrange them in the exact order you want." },
      { step: "Merge & Download", description: "Click 'Merge PDFs'. The tool will instantly combine the files locally and download the new document." }
    ],
    faqs: [
      { question: "Is my data safe when merging PDFs?", answer: "Absolutely. Our PDF tools run 100% locally in your web browser. Your files are never uploaded to our servers or any third party." },
      { question: "How many PDFs can I merge at once?", answer: "There is no strict limit. You can merge as many PDFs as your device's memory can handle, completely free of charge." },
      { question: "Can I reorder the files before merging?", answer: "Yes, once you upload your files, you can easily drag and drop them into the correct sequence before clicking merge." },
      { question: "Does merging reduce the quality of my PDFs?", answer: "No, merging PDFs simply combines the existing pages. It does not compress or reduce the visual quality of your documents." }
    ]
  },

  "image-upscale": {
    longDescription: "Don't let low-resolution photos hold you back. Our AI Image Upscaler uses state-of-the-art super-resolution technology (Real-ESRGAN) to enlarge your images up to 4x their original size without losing clarity. Whether you need to enhance old photographs, prepare images for print, or improve blurry graphics, our tool reconstructs missing details and reduces compression artifacts instantly.",
    howTo: [
      { step: "Upload Low-Res Image", description: "Upload the small or blurry image you want to enhance." },
      { step: "AI Super-Resolution", description: "Our AI model analyzes the image and intelligently predicts and fills in missing pixels to increase the resolution." },
      { step: "Download HD Image", description: "Preview the enhanced image and download your new, crisp, high-resolution file." }
    ],
    faqs: [
      { question: "How much larger will my image get?", answer: "The AI upscaler is designed to increase your image resolution by up to 4x its original dimensions." },
      { question: "Does it work well on faces?", answer: "Yes! Our AI model includes specialized facial enhancement algorithms to ensure faces remain natural and clear when upscaled." },
      { question: "Is there a limit on the input image size?", answer: "To ensure fast processing, we recommend uploading images that are under 1000x1000 pixels. Larger images may take longer or reach memory limits." }
    ]
  }
};
