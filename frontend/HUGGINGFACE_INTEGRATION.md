# AI Medical Record Analysis - Hugging Face Integration

## Overview
The AI Report Summary feature now uses **Hugging Face Inference API** instead of Google Gemini for analyzing medical records and documents.

## Features
- **Image Analysis**: Uses Salesforce's BLIP (Bootstrapping Language-Image Pre-training) model for image captioning
- **Medical Context Enhancement**: Uses Mistral-7B-Instruct for generating detailed medical analysis
- **Fallback Handling**: Gracefully degrades to basic analysis if enhancement fails

## Setup Instructions

### 1. Get a Hugging Face API Key
1. Go to [Hugging Face](https://huggingface.co/)
2. Sign up or log in to your account
3. Navigate to [Settings > Access Tokens](https://huggingface.co/settings/tokens)
4. Click "New token"
5. Give it a name (e.g., "Hospital Management System")
6. Select "Read" permission (sufficient for inference)
7. Copy the generated token

### 2. Configure Environment Variables
1. Create a `.env` file in the `frontend` directory (copy from `.env.example`)
2. Add your Hugging Face API key:
   ```
   VITE_HUGGINGFACE_API_KEY=hf_your_actual_token_here
   ```

### 3. Restart the Development Server
```bash
npm run dev
```

## How It Works

### Step 1: Image Captioning
When you upload a medical record image, it's first sent to the **BLIP image captioning model** which generates a basic description of what's in the image.

### Step 2: Medical Context Enhancement
The basic caption is then enhanced using **Mistral-7B-Instruct**, a powerful language model that:
- Interprets the image description in a medical context
- Provides structured analysis with sections:
  - Summary: Type of medical document/scan
  - Key Observations: Notable elements
  - Clinical Notes: Relevant medical observations

### Step 3: Fallback Mechanism
If the enhancement step fails (e.g., due to API rate limits or model loading), the system falls back to showing the basic caption with a disclaimer.

## Models Used

### 1. Salesforce/blip-image-captioning-large
- **Purpose**: Image understanding and captioning
- **Input**: Medical record images (JPEG, PNG, etc.)
- **Output**: Text description of the image

### 2. mistralai/Mistral-7B-Instruct-v0.2
- **Purpose**: Medical context enhancement
- **Input**: Image caption + medical analysis prompt
- **Output**: Structured medical analysis

## Benefits of Hugging Face

✅ **Open Source**: Free tier available with generous rate limits  
✅ **No API Quotas**: Unlike Gemini's strict quotas  
✅ **Multiple Models**: Easy to switch between different models  
✅ **Privacy**: Can be self-hosted if needed  
✅ **Community**: Large model ecosystem  

## Limitations

⚠️ **Model Loading**: First request may take 20-30 seconds as models load  
⚠️ **Rate Limits**: Free tier has rate limits (check Hugging Face docs)  
⚠️ **Accuracy**: May not be as accurate as specialized medical AI models  

## Troubleshooting

### "Model is loading" Error
If you get a 503 error with "Model is loading", wait 20-30 seconds and try again. The model needs to warm up on first use.

### Rate Limit Errors
If you hit rate limits:
1. Wait a few minutes before retrying
2. Consider upgrading to Hugging Face Pro for higher limits
3. Or implement request queuing in the application

### API Key Issues
- Ensure your API key starts with `hf_`
- Check that it has "Read" permissions
- Verify it's correctly set in the `.env` file
- Restart the dev server after changing `.env`

## Future Improvements

- [ ] Add request caching to reduce API calls
- [ ] Implement retry logic with exponential backoff
- [ ] Add support for multiple medical AI models
- [ ] Store analysis results in database to avoid re-analyzing
- [ ] Add user feedback mechanism to improve prompts

## Alternative Models

You can easily switch to other Hugging Face models by changing the model URL in `gemini.ts`:

### For Image Analysis:
- `nlpconnect/vit-gpt2-image-captioning` - Lighter, faster
- `microsoft/git-large-textcaps` - Better for text in images

### For Text Enhancement:
- `meta-llama/Llama-2-7b-chat-hf` - Alternative to Mistral
- `google/flan-t5-large` - Faster, smaller model

## Support

For issues or questions:
1. Check Hugging Face [documentation](https://huggingface.co/docs/api-inference/index)
2. Review model cards on Hugging Face
3. Check the browser console for detailed error messages
