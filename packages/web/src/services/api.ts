// Constante com a URL base da API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Interface para o resultado da validação facial
export interface ValidationResult {
  isMatch: boolean;
  similarity: number;
  message: string;
}

// Serviço para validação facial
export const faceValidationService = {
  /**
   * Valida duas imagens faciais
   * @param referenceImage - Imagem de referência (documento)
   * @param selfieImage - Selfie para comparação
   * @returns Resultado da validação
   */
  async validateFaces(referenceImage: File, selfieImage: File): Promise<ValidationResult> {
    try {
      // Cria um FormData para enviar os arquivos
      const formData = new FormData();
      formData.append('reference', referenceImage);
      formData.append('selfie', selfieImage);

      // Faz a requisição para a API
      const response = await fetch(`${API_URL}/validate-faces`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Erro na validação: ${response.status}`);
      }

      return await response.json();
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