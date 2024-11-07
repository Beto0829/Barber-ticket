import { useState, useEffect } from 'react';
import { db, doc, getDoc, updateDoc, arrayUnion, setDoc } from './firebase_config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, User, Clock, Users, Menu, X } from 'lucide-react';
import { To, useNavigate } from 'react-router-dom'

interface Ticket {
  nombre: string;
  numero: number;
  fechaCreacion: string;
  precioServicio?: number;
  fechaFinalizacion?: string;
}

export default function TicketPage() {
  const [nombre, setNombre] = useState('');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [nextNumber, setNextNumber] = useState(1);
  const [clientesAtendidos, setClientesAtendidos] = useState(0);
  const [precioServicio, setPrecioServicio] = useState<number | null>(null);
  const [ticketSeleccionado, setTicketSeleccionado] = useState<Ticket | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate()

  useEffect(() => {
    const fetchTickets = async () => {
      const ticketDocRef = doc(db, 'Turns', 'Tickets');
      const docSnap = await getDoc(ticketDocRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && Array.isArray(data.tickets)) {
          setTickets(data.tickets);
          setNextNumber(data.tickets.length + 1);
        }
      }
    };

    fetchTickets();
  }, []);

  useEffect(() => {
    const fetchClientesAtendidos = async () => {
      const currentDate = new Date().toISOString().split('T')[0];
      const historialDocRef = doc(db, 'Turns', 'HistorialTickets');
      const docSnap = await getDoc(historialDocRef);

      if (docSnap.exists()) {
        const existingData = docSnap.data();
        if (existingData && existingData[currentDate]) {
          setClientesAtendidos(existingData[currentDate].totalClientesAtendidos || 0);
        }
      }
    };

    fetchClientesAtendidos();
  }, [tickets]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nombre.trim() === '') return;

    const fechaCreacion = new Date().toISOString();

    const newTicket: Ticket = {
      nombre,
      numero: nextNumber,
      fechaCreacion,
    };

    try {
      const ticketDocRef = doc(db, 'Turns', 'Tickets');
      await updateDoc(ticketDocRef, {
        tickets: arrayUnion(newTicket),
      });

      setTickets([...tickets, newTicket]);
      setNextNumber(nextNumber + 1);
      setNombre('');
    } catch (error) {
      console.error("Error al guardar el ticket en Firestore:", error);
    }
  };

  const handleTicketComplete = async (ticket: Ticket) => {
    setTicketSeleccionado(ticket);
  };

  const handleConfirmPrice = async () => {
    if (!ticketSeleccionado || precioServicio === null) return;

    const completedTicket = {
      ...ticketSeleccionado,
      fechaFinalizacion: new Date().toISOString(),
      precioServicio,
    };

    const currentDate = new Date().toISOString().split('T')[0];
    const historialDocRef = doc(db, 'Turns', 'HistorialTickets');
    const gananciasDocRef = doc(db, 'Ganancias', currentDate);

    const docSnap = await getDoc(historialDocRef);
    if (docSnap.exists()) {
      const existingData = docSnap.data();
      if (existingData && existingData[currentDate]) {
        await updateDoc(historialDocRef, {
          [`${currentDate}.tickets`]: arrayUnion(completedTicket),
          [`${currentDate}.totalClientesAtendidos`]: (existingData[currentDate].totalClientesAtendidos || 0) + 1,
        });
      } else {
        await updateDoc(historialDocRef, {
          [currentDate]: {
            tickets: [completedTicket],
            totalClientesAtendidos: 1,
          },
        });
      }
    } else {
      await setDoc(historialDocRef, {
        [currentDate]: {
          tickets: [completedTicket],
          totalClientesAtendidos: 1,
        },
      });
    }

    const gananciasDocSnap = await getDoc(gananciasDocRef);
    if (gananciasDocSnap.exists()) {
      const existingGananciasData = gananciasDocSnap.data();
      const newTotalGanancia = (existingGananciasData.totalDeGanancia || 0) + precioServicio;
      
      await updateDoc(gananciasDocRef, {
        tickets: arrayUnion(completedTicket),
        totalDeGanancia: newTotalGanancia,
      });
    } else {
      await setDoc(gananciasDocRef, {
        tickets: [completedTicket],
        totalDeGanancia: precioServicio,
      });
    }

    const updatedTickets = tickets.filter((t) => t.numero !== ticketSeleccionado.numero);
    await updateDoc(doc(db, 'Turns', 'Tickets'), {
      tickets: updatedTickets,
    });

    setTickets(updatedTickets);
    setTicketSeleccionado(null);
    setPrecioServicio(null);
  };

  const handleCancel = () => {
    setTicketSeleccionado(null);
    setPrecioServicio(null);
  };
  
  const handleNavege = (ruta: To) => {
    navigate(ruta)
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      {/* Botón de Menú */}
      <button onClick={toggleMenu} className="absolute top-4 left-4 z-50 p-2 bg-gray-800 rounded">
        <Menu className="h-8 w-8 text-white" />
      </button>

      {/* Menú lateral desplegable */}
      {isMenuOpen && (
        <div className="fixed inset-y-0 left-0 w-48 bg-gray-800 text-white p-4 shadow-lg z-50">
          <div className="flex justify-between items-center mb-4">
            <p className="font-bold text-lg">Menú</p>
            {/* Botón para cerrar el menú */}
            <button onClick={toggleMenu} className="text-white p-1">
              <X className="h-6 w-6" />
            </button>
          </div>
          <button onClick={() => handleNavege("/finanzas")} className="w-full text-left p-2 hover:bg-gray-700 mb-2">
            Finanzas
          </button>
          <button onClick={() => alert('Navegar a Tickets')} className="w-full text-left p-2 hover:bg-gray-700 mb-2">
            Tickets
          </button>
          {/* Puedes seguir añadiendo más botones aquí y aplicar `mb-2` en cada uno */}
        </div>
      )}
      
      <div className="relative w-full max-w-md px-4 py-12">
        {/* Botón de Cerrar Sesión */}
        {/* <div className="absolute top-4 right-4">
          <Button variant="outline" className="bg-white/20 hover:bg-white/30 text-foreground">
            Cerrar Sesión
          </Button>
        </div> */}

        <div className="space-y-8 text-center">
          <div className="flex justify-center">
            <img src="/logo.png" alt="EuryBarber Logo" className="w-32 h-32 object-contain" />
          </div>

          <Card className="bg-black text-white">
            <CardContent className="flex items-center gap-4 p-4">
              <Users className="h-8 w-8" />
              <div>
                <p className="text-sm">Clientes Atendidos</p>
                <p className="text-4xl font-bold">{clientesAtendidos}</p>
              </div>
            </CardContent>
          </Card>

          <div>
            <h1 className="text-2xl font-bold mb-4">Reserva tu turno</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Tu nombre" className="bg-white" />
              <Button type="submit" className="w-full bg-black text-white hover:bg-black/90">
                Reservar
              </Button>
            </form>
          </div>

          <div className="space-y-4">
            {tickets.map((ticket) => (
              <Card key={ticket.numero} className="bg-black text-white">
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-medium">
                      Turno #{ticket.numero}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-white/10"
                      onClick={() => handleTicketComplete(ticket)}
                    >
                      <CheckCircle className="h-4 w-4 text-white" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-1">
                  <p className="flex items-center text-gray-400 text-sm gap-2">
                    <User className="h-4 w-4" /> {ticket.nombre}
                  </p>
                  <p className="flex items-center text-gray-400 text-sm gap-2">
                    <Clock className="h-4 w-4" />
                    {new Date(ticket.fechaCreacion).toLocaleDateString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {ticketSeleccionado && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
            <div className="bg-white p-8 rounded-lg w-11/12 max-w-lg text-center">
              <h2 className="text-xl font-bold mb-4">Completar Ticket</h2>
              <p>Precio del servicio:</p>
              <Input
                type="number"
                value={precioServicio ?? ''}
                onChange={(e) => setPrecioServicio(Number(e.target.value))}
                placeholder="Precio del servicio"
                className="bg-gray-200"
              />
              <div className="flex gap-4 mt-4 justify-center">
                <Button onClick={handleConfirmPrice} className="bg-green-500 text-white hover:bg-green-600">
                  Confirmar
                </Button>
                <Button onClick={handleCancel} className="bg-gray-300 text-black hover:bg-gray-400">
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
