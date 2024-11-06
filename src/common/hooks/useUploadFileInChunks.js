import { useState } from 'react';
import bc from '../services/breathecode';
import { getStorageItem } from '../../utils';

const useUploadFileInChunks = () => {
  const [isSplitting, setIsSplitting] = useState(false);
  const [isUploadingChunks, setIsUploadingChunks] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [error, setError] = useState(null);

  const getOperationMeta = async (operationType) => {
    const response = await bc.media().operationMeta(operationType);
    return response.data;
  };

  const splitFileIntoChunks = (file, chunkSize) => {
    const chunks = [];
    let start = 0;

    while (start < file.size) {
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end, file.type);
      chunks.push(chunk);
      start = end;
    }
    return chunks;
  };

  const uploadChunk = async (file, chunk, operationType, totalChunks, chunkIndex, academyID = undefined) => {
    try {
      const prefix = academyID ? 'academy/chunk' : 'me/chunk';
      const formData = new FormData();
      formData.append('operation_type', operationType);
      formData.append('filename', file.name);
      formData.append('total_chunks', totalChunks);
      formData.append('chunk', chunk);
      formData.append('chunk_index', chunkIndex);

      const accessToken = getStorageItem('accessToken');
      if (!accessToken && !academyID) {
        throw new Error("Couldn't find the accessToken, make sure you are passing it");
      }

      const headers = academyID ? { Academy: academyID } : { Authorization: `Token ${accessToken}` };
      const response = await bc.media().uploadChunk(prefix, formData, headers);

      return response;
    } catch (err) {
      console.error(`Error uploading chunk ${chunkIndex}:`, err);
      throw err;
    }
  };

  const endFileUpload = async (operationType, totalChunks, filename, mime, meta, academyID = undefined) => {
    const prefix = academyID ? 'academy/chunk/upload' : 'me/chunk/upload';
    const response = await bc.media().endFileUpload(prefix, {
      operation_type: operationType,
      total_chunks: totalChunks,
      filename,
      mime,
      meta,
    });

    return response.data;
  };

  const uploadFileInChunks = async (file, operationType, meta, academyID = undefined) => {
    setIsSplitting(true);
    setError(null);

    try {
      const { chunk_size: chunkSize, max_chunks: maxChunks } = await getOperationMeta(operationType);

      // Dividir el archivo en chunks
      const chunks = splitFileIntoChunks(file, chunkSize);
      setIsSplitting(false);

      const totalChunks = chunks.length;
      if (maxChunks && totalChunks > maxChunks) {
        throw new Error(`Too many pieces. Max allowed: ${maxChunks}`);
      }

      setIsUploadingChunks(true);
      const uploadResponses = await Promise.all(
        chunks.map(async (chunk, index) => uploadChunk(file, chunk, operationType, totalChunks, index, academyID)),
      );
      setIsUploadingChunks(false);

      const lastResponse = uploadResponses[uploadResponses.length - 1];
      const { mime, name } = lastResponse?.data ?? {};

      setIsFinalizing(true);
      const finalResponse = await endFileUpload(operationType, totalChunks, name, mime, meta, academyID);
      setIsFinalizing(false);

      return finalResponse;
    } catch (err) {
      console.error('Error uploading file:', err);
      setError(err);
      setIsSplitting(false);
      setIsUploadingChunks(false);
      setIsFinalizing(false);
      throw err;
    }
  };

  return {
    uploadFileInChunks,
    isSplitting,
    isUploadingChunks,
    isFinalizing,
    error,
  };
};

export default useUploadFileInChunks;
