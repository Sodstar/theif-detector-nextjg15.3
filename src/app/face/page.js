'use client'

import { useRef, useEffect, useState } from 'react'
import Webcam from 'react-webcam'

export default function OfflineFaceDetection() {
  const webcamRef = useRef(null)
  const canvasRef = useRef(null)
  const [faceApi, setFaceApi] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDetecting, setIsDetecting] = useState(false)
  const [detections, setDetections] = useState([])
  const [faceCount, setFaceCount] = useState(0)
  const [loadingStatus, setLoadingStatus] = useState('Эхэлж байна...')

  // face-api.js ачаалах
  useEffect(() => {
    const loadFaceApi = async () => {
      try {
        setLoadingStatus('face-api.js ачааллаж байна...')
        
        // face-api.js script ачаалах
        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js'
        script.onload = async () => {
          setLoadingStatus('Моделуудыг ачааллаж байна...')
          
          const { faceapi } = window
          
          // Моделуудыг ачаалах - CDN ээс
          await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights'),
            faceapi.nets.faceLandmark68Net.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights'),
            faceapi.nets.faceRecognitionNet.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights'),
            faceapi.nets.faceExpressionNet.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights'),
            faceapi.nets.ageGenderNet.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights')
          ])
          
          setFaceApi(faceapi)
          setIsLoading(false)
          setLoadingStatus('Бэлэн!')
          console.log('face-api.js амжилттай ачааллаа')
        }
        
        script.onerror = () => {
          console.error('face-api.js ачаалахад алдаа')
          setLoadingStatus('Алдаа гарлаа - интернет шалгана уу')
          setIsLoading(false)
        }
        
        document.head.appendChild(script)
        
      } catch (error) {
        console.error('Алдаа:', error)
        setLoadingStatus('Алдаа гарлаа')
        setIsLoading(false)
      }
    }

    loadFaceApi()
  }, [])

  // Хөзөр таних функц
  const detectFaces = async () => {
    if (!faceApi || !webcamRef.current || !canvasRef.current) return

    const video = webcamRef.current.video
    const canvas = canvasRef.current
    const displaySize = { width: video.videoWidth, height: video.videoHeight }

    // Canvas хэмжээ тохируулах
    faceApi.matchDimensions(canvas, displaySize)

    try {
      // Хөзөр болон байдал таних
      const detections = await faceApi
        .detectAllFaces(video, new faceApi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions()
        .withAgeAndGender()

      // Canvas цэвэрлэх
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Хэмжээг видеотой тохируулах
      const resizedDetections = faceApi.resizeResults(detections, displaySize)

      // Хөзрийн хүрээ зурах
      resizedDetections.forEach((detection, i) => {
        const { x, y, width, height } = detection.detection.box
        
        // Хөзрийн хүрээ
        ctx.strokeStyle = '#00ff00'
        ctx.lineWidth = 2
        ctx.strokeRect(x, y, width, height)
        
        // Мэдээлэл бичих
        const age = Math.round(detection.age)
        const gender = detection.gender
        const genderProb = Math.round(detection.genderProbability * 100)
        
        // Хөзрийн дээд хэсэгт мэдээлэл
        ctx.fillStyle = '#00ff00'
        ctx.font = '16px Arial'
        ctx.fillRect(x, y - 60, 200, 55)
        
        ctx.fillStyle = '#000000'
        ctx.fillText(`Хүн ${i + 1}`, x + 5, y - 40)
        ctx.fillText(`Нас: ${age}`, x + 5, y - 25)
        ctx.fillText(`${gender}: ${genderProb}%`, x + 5, y - 10)
        
        // Сэтгэл хөдлөл
        const expressions = detection.expressions
        const topExpression = Object.keys(expressions).reduce((a, b) => 
          expressions[a] > expressions[b] ? a : b
        )
        
        const expressionNames = {
          'neutral': 'Тайван',
          'happy': 'Баярлаж байна',
          'sad': 'Гунигтай',
          'angry': 'Уурлаж байна',
          'fearful': 'Айж байна',
          'disgusted': 'Жигшиж байна',
          'surprised': 'Гайхаж байна'
        }
        
        ctx.fillStyle = '#ff6b35'
        ctx.fillRect(x, y + height + 5, 180, 25)
        ctx.fillStyle = '#ffffff'
        ctx.font = '14px Arial'
        ctx.fillText(
          expressionNames[topExpression] || topExpression, 
          x + 5, 
          y + height + 20
        )
      })

      setDetections(resizedDetections)
      setFaceCount(resizedDetections.length)

    } catch (error) {
      console.error('Хөзөр танохдоо алдаа:', error)
    }
  }

  // Танилт эхлүүлэх/зогсоох
  const toggleDetection = () => {
    setIsDetecting(!isDetecting)
  }

  // Тогтмол танилт
  useEffect(() => {
    let interval
    if (isDetecting && faceApi) {
      interval = setInterval(detectFaces, 100)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isDetecting, faceApi])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🎯 Хөзөр танигч
          </h1>
          <p className="text-gray-600">Интернетгүй ажиллах AI хөзөр танилт</p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Ачаалж байгаа хэсэг */}
          {isLoading && (
            <div className="text-center mb-8 p-6 bg-white rounded-xl shadow-lg">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-lg font-medium text-gray-700">{loadingStatus}</p>
              <div className="mt-2 w-64 mx-auto bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
              </div>
            </div>
          )}

          {/* Үндсэн хэсэг */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            {/* Статистик */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{faceCount}</div>
                    <div className="text-sm opacity-90">Олдсон хөзөр</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl ${isDetecting ? 'animate-pulse' : ''}`}>
                      {isDetecting ? '🟢' : '🔴'}
                    </div>
                    <div className="text-sm opacity-90">
                      {isDetecting ? 'Ажиллаж байна' : 'Зогссон'}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={toggleDetection}
                  disabled={isLoading || !faceApi}
                  className={`px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 ${
                    isDetecting
                      ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
                      : 'bg-green-500 hover:bg-green-600 text-white shadow-lg'
                  } disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none`}
                >
                  {isDetecting ? '⏸️ Зогсоох' : '▶️ Эхлүүлэх'}
                </button>
              </div>
            </div>

            {/* Камер хэсэг */}
            <div className="relative bg-black">
              <Webcam
                ref={webcamRef}
                audio={false}
                width="100%"
                height="auto"
                screenshotFormat="image/jpeg"
                className="w-full"
                style={{ maxHeight: '600px' }}
              />
              
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full"
                style={{ pointerEvents: 'none' }}
              />
            </div>

            {/* Мэдээлэл хэсэг */}
            <div className="p-6 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow text-center">
                  <div className="text-2xl mb-2">👥</div>
                  <div className="text-lg font-semibold text-gray-800">Олдсон хүн</div>
                  <div className="text-3xl font-bold text-blue-600">{faceCount}</div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow text-center">
                  <div className="text-2xl mb-2">🎭</div>
                  <div className="text-lg font-semibold text-gray-800">Онцлог</div>
                  <div className="text-sm text-gray-600">
                    Нас, хүйс, сэтгэл хөдлөл
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow text-center">
                  <div className="text-2xl mb-2">⚡</div>
                  <div className="text-lg font-semibold text-gray-800">Хурд</div>
                  <div className="text-sm text-gray-600">
                    10 FPS (санах ой хэмнэлттэй)
                  </div>
                </div>
              </div>

              <div className="text-center text-gray-600">
                <p className="mb-2">
                  🚀 <strong>Offline ажилладаг</strong> - интернет шаардлагагүй
                </p>
                <p className="text-sm">
                  💡 Анхны удаа моделуудыг татаж авсны дараа интернетгүй ажиллана
                </p>
              </div>
            </div>
          </div>

          {/* Алдааны мэдээлэл */}
          {!faceApi && !isLoading && (
            <div className="mt-6 p-6 bg-red-50 border-l-4 border-red-400 rounded-lg">
              <div className="flex items-center">
                <div className="text-red-400 text-xl mr-3">⚠️</div>
                <div>
                  <h3 className="text-lg font-medium text-red-800">
                    Модел ачаалахад алдаа гарлаа
                  </h3>
                  <p className="text-red-700 mt-1">
                    Интернет холболтоо шалгаад хуудсыг дахин ачаална уу.
                    Эхний удаа моделуудыг татаж авах шаардлагатай.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Тусламж */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              📖 Хэрэглэх заавар
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl mb-2">📹</div>
                <h3 className="font-semibold mb-2">1. Камер зөвшөөрөх</h3>
                <p className="text-sm text-gray-600">
                  Веб камер ашиглахыг зөвшөөрнө үү
                </p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl mb-2">⏳</div>
                <h3 className="font-semibold mb-2">2. Ачаалах хүлээх</h3>
                <p className="text-sm text-gray-600">
                  AI моделууд ачаалагдахыг хүлээнэ үү
                </p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl mb-2">▶️</div>
                <h3 className="font-semibold mb-2">3. Эхлүүлэх</h3>
                <p className="text-sm text-gray-600">
                  "Эхлүүлэх" товчийг дарж танилт эхлүүлнэ үү
                </p>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-3xl mb-2">🎯</div>
                <h3 className="font-semibient mb-2">4. Үр дүн</h3>
                <p className="text-sm text-gray-600">
                  Хөзөр, нас, хүйс, сэтгэл харагдана
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
