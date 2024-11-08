'use client'

import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { db, doc, getDoc } from './firebase_config';
import TicketSearchComponent from "./componente_busqueda"; // Importa el componente

const ADMIN_PIN = '0903'

const heroImages = [
  "https://www.shutterstock.com/image-photo/empty-wooden-tabletop-product-display-600nw-2374648881.jpg",
  "https://img.freepik.com/foto-gratis/herramientas-salon-marco-vintage-mesa-madera-trabajos-concepto-carrera_53876-143259.jpg",
  "https://wallpapers.com/images/hd/barber-shop-background-ombr14lgcb5revwr.jpg",
  "https://e1.pxfuel.com/desktop-wallpaper/597/511/desktop-wallpaper-barber.jpg",
  "https://wallpapers.com/images/hd/barber-shop-background-n0rb2wq1eqb06dow.jpg"
]

export default function MainPage() {
  const navigate = useNavigate()
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [pin, setPin] = useState(['', '', '', ''])
  const [error, setError] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [nextTicketNumber, setNextTicketNumber] = useState<number | null>(null);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchTickets = async () => {
      const ticketDocRef = doc(db, 'Turns', 'Tickets');
      const docSnap = await getDoc(ticketDocRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && Array.isArray(data.tickets)) {
          const allTicketNumbers = data.tickets.map((ticket: any) => ticket.numero);
          const nextTicket = Math.min(...allTicketNumbers);
          setNextTicketNumber(nextTicket);
        }
      }
    };

    fetchTickets();
  }, []);

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0]
    if (!/^\d*$/.test(value)) return

    const newPin = [...pin]
    newPin[index] = value
    setPin(newPin)
    setError(false)

    if (value !== '') {
      if (index < 3) {
        inputRefs[index + 1].current?.focus()
      } else {
        const enteredPin = newPin.join('')
        if (enteredPin === ADMIN_PIN) {
          sessionStorage.setItem('authMessage', 'codigoValido')
          setTimeout(() => {
            sessionStorage.removeItem('authMessage')
          }, 1800000)
          setIsLoginOpen(false)
          navigate('/admin')
        } else if (enteredPin.length === 4) {
          setError(true)
          setTimeout(() => {
            setPin(['', '', '', ''])
            inputRefs[0].current?.focus()
          }, 1000)
        }
      }
    } else if (index > 0) {
      inputRefs[index - 1].current?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && pin[index] === '' && index > 0) {
      inputRefs[index - 1].current?.focus()
    }
  }

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + heroImages.length) % heroImages.length)
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <div className="relative">
        <div className="absolute inset-0">
          {heroImages.map((img, index) => (
            <img
              key={img}
              src={img}
              alt={`Barbería imagen ${index + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}
          <div className="absolute inset-0 bg-black bg-opacity-50" />
        </div>
        
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-screen">
          <div className="absolute right-4 top-4 z-20 flex space-x-2">
            <div className="ml-4">
              <TicketSearchComponent />
            </div>
            <Button 
              variant="outline"
              onClick={() => setIsLoginOpen(true)}
              className="bg-white/20 hover:bg-white/30 text-white"
            >
              Iniciar Sesión
            </Button>
          </div>
          
          <div className="text-center">
            <img
              src="./logo.png"
              alt="EuryBarber Logo"
              className="mx-auto w-40 h-40 object-contain mb-8"
            />
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              Bienvenido a EuryBarber
            </h1>
            <p className="mt-3 text-base text-gray-300 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl">
              Descubre el arte de la barbería en nuestro exclusivo salón.
            </p>
            
            {nextTicketNumber !== null && (
              <div className="mt-4 p-4 bg-white/10 text-white border border-gray-300 rounded-lg shadow-lg text-center max-w-md mx-auto backdrop-blur-sm">
                <h2 className="text-2xl font-semibold text-gray-100">
                  Turno Actual:
                </h2>
                <p className="text-4xl font-bold text-red-500 mt-2">
                  {nextTicketNumber}
                </p>
              </div>
            )}
          </div>
          
          <div className="mt-8 flex justify-center space-x-4">
            <Button onClick={prevImage} variant="outline" size="icon" className="bg-white/20 hover:bg-white/30">
              <ChevronLeft className="h-6 w-6 text-white" />
            </Button>
            <Button onClick={nextImage} variant="outline" size="icon" className="bg-white/20 hover:bg-white/30">
              <ChevronRight className="h-6 w-6 text-white" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ingrese el código de acceso</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center space-x-4 py-4">
            {pin.map((digit, index) => (
              <Input
                key={index}
                ref={inputRefs[index]}
                type="text"
                value={digit}
                onChange={(e) => handlePinChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`w-12 h-12 text-center text-2xl ${
                  error ? 'border-red-500 animate-shake' : ''
                }`}
                maxLength={1}
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
