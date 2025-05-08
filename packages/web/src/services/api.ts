const API_URL = process.env.NEXT_PUBLIC_API_URL

export interface ValidationResult {
  isMatch: boolean;
  similarity: number;
  message?: string;
  debugInfo?: any;
}

export const faceValidationService = {
  async validateFaces(referenceImage: File, selfieImage: File): Promise<ValidationResult> {
    try {
      const formData = new FormData();
      formData.append('image1', referenceImage);
      formData.append('image2', selfieImage);

      const response = await fetch(`${API_URL}/api/validate-faces`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Erro na validação: ${response.status}`);
      }

      const responseData = await response.json();

      if (responseData.success === true && responseData.data) {
        return {
          isMatch: responseData.data.isMatch,
          similarity: responseData.data.similarity,
          debugInfo: responseData.data.debugInfo,
          message: responseData.data.isMatch ? 'Faces correspondem!' : 'Faces não correspondem.'
        };
      } else if (responseData.success === false) {
        return {
          isMatch: false,
          similarity: 0,
          message: responseData.error || 'Erro na validação facial.'
        };
      } else {
        return responseData;
      }
    } catch (error) {
      console.error('Erro ao validar faces:', error);
      return {
        isMatch: false,
        similarity: 0,
        message: `Erro no processo de validação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      };
    }
  }
};