'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { faceValidationService, ValidationResult } from '@/services/api';

export default function FaceValidator() {
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [selfieImage, setSelfieImage] = useState<File | null>(null);
  const [referencePreview, setReferencePreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const referenceInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  const handleReferenceChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setReferenceImage(file);

      const reader = new FileReader();
      reader.onload = (event) => {
        setReferencePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelfieChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelfieImage(file);

      const reader = new FileReader();
      reader.onload = (event) => {
        setSelfiePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationResult(null);

    if (!referenceImage || !selfieImage) {
      setError('Por favor, selecione ambas as imagens.');
      return;
    }

    try {
      setIsLoading(true);
      const result = await faceValidationService.validateFaces(referenceImage, selfieImage);
      setValidationResult(result);
    } catch (err) {
      setError(`Erro na validação: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setReferenceImage(null);
    setSelfieImage(null);
    setReferencePreview(null);
    setSelfiePreview(null);
    setValidationResult(null);
    setError(null);

    if (referenceInputRef.current) referenceInputRef.current.value = '';
    if (selfieInputRef.current) selfieInputRef.current.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Validação Facial KYC</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Seção para upload da imagem de referência */}
          <div className="border p-4 rounded-md">
            <h3 className="text-lg font-semibold mb-3">Documento com Foto</h3>
            <div className="mb-4 h-56 bg-gray-100 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center overflow-hidden">
              {referencePreview ? (
                <img src={referencePreview} alt="Documento" className="max-h-full max-w-full object-contain" />
              ) : (
                <p className="text-gray-500 text-center">Nenhuma imagem selecionada</p>
              )}
            </div>
            <div>
              <input
                ref={referenceInputRef}
                type="file"
                accept="image/*"
                onChange={handleReferenceChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>

          {/* Seção para upload da selfie */}
          <div className="border p-4 rounded-md">
            <h3 className="text-lg font-semibold mb-3">Selfie</h3>
            <div className="mb-4 h-56 bg-gray-100 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center overflow-hidden">
              {selfiePreview ? (
                <img src={selfiePreview} alt="Selfie" className="max-h-full max-w-full object-contain" />
              ) : (
                <p className="text-gray-500 text-center">Nenhuma imagem selecionada</p>
              )}
            </div>
            <div>
              <input
                ref={selfieInputRef}
                type="file"
                accept="image/*"
                onChange={handleSelfieChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>
        </div>

        {/* Mensagens de erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Resultado da validação */}
        {validationResult && (
          <div className={`p-4 rounded-md ${validationResult.isMatch ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
            <h3 className={`text-lg font-semibold mb-2 ${validationResult.isMatch ? 'text-green-700' : 'text-yellow-700'}`}>
              {validationResult.isMatch ? 'Validação bem-sucedida!' : 'Validação falhou'}
            </h3>
            <p className="mb-2">
              Similaridade: <span className="font-semibold">{(validationResult.similarity * 100).toFixed(2)}%</span>
            </p>
            <p>{validationResult.message}</p>
          </div>
        )}

        {/* Botões de ação */}
        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={resetForm}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Limpar
          </button>
          <button
            type="submit"
            disabled={!referenceImage || !selfieImage || isLoading}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${
              (!referenceImage || !selfieImage || isLoading) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Validando...' : 'Validar Faces'}
          </button>
        </div>
      </form>
    </div>
  );
}