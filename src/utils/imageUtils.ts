// 이미지 URI 감지 및 변환 유틸리티

// 이미지 확장자 패턴
const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|gif|bmp|webp|svg|ico)(\?.*)?$/i

// 이미지 URI 패턴 (일반적인 이미지 호스팅 서비스 포함)
const IMAGE_URI_PATTERNS = [
  // HTTP/HTTPS URL
  /https?:\/\/.*\.(jpg|jpeg|png|gif|bmp|webp|svg|ico)(\?.*)?$/i,
  /https?:\/\/.*\.(imgur|flickr|unsplash|pexels|pixabay)\.com\/.*$/i,
  /https?:\/\/.*\.(googleusercontent|amazonaws|cloudinary)\.com\/.*$/i,
  // Data URI (base64 인코딩된 이미지)
  /^data:image\/(png|jpg|jpeg|gif|webp|svg\+xml|bmp|ico);base64,/i,
  // Blob URI
  /^blob:https?:\/\/.*$/i,
  // File URI
  /^file:\/\/.*\.(jpg|jpeg|png|gif|bmp|webp|svg|ico)$/i,
  // FTP URI
  /^ftp:\/\/.*\.(jpg|jpeg|png|gif|bmp|webp|svg|ico)$/i,
]

// URI가 이미지인지 확인
export const isImageUri = (uri: string): boolean => {
  try {
    // Data URI 체크
    if (uri.startsWith('data:image/')) {
      return true
    }
    
    // Blob URI 체크
    if (uri.startsWith('blob:')) {
      return true
    }
    
    // File URI 체크
    if (uri.startsWith('file://')) {
      return IMAGE_EXTENSIONS.test(uri)
    }
    
    // 일반 URL 체크
    const urlObj = new URL(uri)
    
    // 확장자로 확인
    if (IMAGE_EXTENSIONS.test(urlObj.pathname)) {
      return true
    }
    
    // 패턴으로 확인
    return IMAGE_URI_PATTERNS.some(pattern => pattern.test(uri))
  } catch {
    return false
  }
}

// 텍스트에서 이미지 URI 추출
export const extractImageUris = (text: string): string[] => {
  // 다양한 URI 패턴을 감지하는 정규식
  const uriRegex = /(?:https?:\/\/[^\s<>"{}|\\^`\[\]]+|data:image\/[^;]+;base64,[^\s<>"{}|\\^`\[\]]+|blob:https?:\/\/[^\s<>"{}|\\^`\[\]]+|file:\/\/[^\s<>"{}|\\^`\[\]]+|ftp:\/\/[^\s<>"{}|\\^`\[\]]+)/g
  const uris = text.match(uriRegex) || []
  return uris.filter(isImageUri)
}

// 이미지 URI를 마크다운 이미지 문법으로 변환
export const convertUrisToImages = (text: string): string => {
  // 이미 마크다운 이미지 문법이 포함되어 있으면 변환을 건너뜁니다.
  // 기존 이미지를 다시 감싸면 구문이 깨져 src가 사라지는 문제가 발생할 수 있습니다.
  const hasMarkdownImage = /!\[[^\]]*\]\([^\)]+\)/.test(text)
  if (hasMarkdownImage) {
    return text
  }

  const imageUris = extractImageUris(text)
  
  let result = text
  imageUris.forEach(uri => {
    // 일반 URI를 마크다운 이미지로 변환
    const imageMarkdown = `![이미지](${uri})`
    // 단순 치환: 이미지를 포함하지 않는 텍스트에서만 동작하므로 안전
    result = result.replace(uri, imageMarkdown)
  })
  
  return result
}

// 하위 호환성을 위한 별칭
export const extractImageUrls = extractImageUris
export const convertUrlsToImages = convertUrisToImages
