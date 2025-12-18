
import { GoogleGenAI, Type } from "@google/genai";

export interface MRZData {
  passportNumber: string;
  fullName: string;
  dob: string; 
  expiryDate: string;
  nationality: string;
  sex: string;
  pob: string;
  placeOfIssue: string;
}

const fileToBase64 = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error("Failed to read file"));
        return;
      }
      const base64Data = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const processPassportImage = async (file: File): Promise<MRZData> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API Key missing. Configuration error.");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const base64Data = await fileToBase64(file);
    
    const prompt = `You are a passport data extraction expert. Extract details from this passport.
            
    STRICT NAMING RULE:
    1. For Ethiopian Passports: Full Name = [Given Names] + [Surname]. 
    2. Given Names usually contains First and Father's name. Surname contains Grandfather's name.
    3. Ensure no names are skipped. 
    
    OUTPUT REQUIREMENTS:
    - fullName: Full constructed name in UPPERCASE.
    - passportNumber: Uppercase alphanumeric.
    - dob: YYYY-MM-DD format.
    - expiryDate: YYYY-MM-DD format.
    - pob: Place of Birth.
    - placeOfIssue: Default to 'ADDIS ABABA' if not found.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: file.type || 'image/jpeg', data: base64Data } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fullName: { type: Type.STRING },
            passportNumber: { type: Type.STRING },
            nationality: { type: Type.STRING },
            dob: { type: Type.STRING },
            sex: { type: Type.STRING },
            expiryDate: { type: Type.STRING },
            pob: { type: Type.STRING },
            placeOfIssue: { type: Type.STRING }
          },
          required: ["fullName", "passportNumber", "dob", "expiryDate"]
        }
      }
    });

    const data = JSON.parse(response.text || '{}');

    return {
      fullName: data.fullName?.toUpperCase() || '',
      passportNumber: data.passportNumber?.toUpperCase() || '',
      dob: data.dob || '',
      expiryDate: data.expiryDate || '',
      nationality: data.nationality?.toUpperCase() || 'ETHIOPIAN',
      sex: data.sex?.toUpperCase() || '',
      pob: data.pob?.toUpperCase() || 'ADDIS ABABA',
      placeOfIssue: data.placeOfIssue?.toUpperCase() || 'ADDIS ABABA'
    };

  } catch (error: any) {
    throw new Error(`Passport Scan Failed: ${error.message}`);
  }
};
