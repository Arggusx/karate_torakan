/**
 * Reduz uma imagem escolhida pelo usuário a um quadrado pequeno e devolve um
 * data URL JPEG. Rodar no navegador antes de subir economiza banda e mantém a
 * foto de perfil leve o bastante para caber numa coluna de texto do banco.
 */
export async function imagemParaAvatar(
  arquivo: File,
  lado = 256,
  qualidade = 0.82,
): Promise<string> {
  const bitmap = await carregar(arquivo);

  const canvas = document.createElement("canvas");
  canvas.width = lado;
  canvas.height = lado;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Não foi possível processar a imagem.");

  // Recorte central quadrado: o lado menor manda, para não distorcer o rosto.
  const corte = Math.min(bitmap.width, bitmap.height);
  const sx = (bitmap.width - corte) / 2;
  const sy = (bitmap.height - corte) / 2;
  ctx.drawImage(bitmap, sx, sy, corte, corte, 0, 0, lado, lado);

  if ("close" in bitmap && typeof bitmap.close === "function") bitmap.close();

  return canvas.toDataURL("image/jpeg", qualidade);
}

/** createImageBitmap quando existe; <img> como reserva para navegadores sem ele. */
async function carregar(
  arquivo: File,
): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    return createImageBitmap(arquivo);
  }

  const url = URL.createObjectURL(arquivo);
  try {
    const img = new Image();
    await new Promise<void>((resolver, rejeitar) => {
      img.onload = () => resolver();
      img.onerror = () => rejeitar(new Error("Imagem inválida."));
      img.src = url;
    });
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}
