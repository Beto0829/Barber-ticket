import { useState, useEffect } from 'react';
import { db, doc, getDoc, updateDoc, arrayUnion, setDoc } from './firebase_config'; // Asegúrate de tener la configuración de Firebase
import { Button } from '@/components/ui/button'; // Componentes UI
import { Input } from '@/components/ui/input'; // Componentes UI
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Componentes UI
import { Sun, Moon, CheckCircle, User, Scissors, Clock, Users } from 'lucide-react'; // Iconos

interface Ticket {
  nombre: string;
  numero: number;
  expiracion: string;
}

export default function TicketPage() {
  const [nombre, setNombre] = useState('');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [nextNumber, setNextNumber] = useState(1);
  const [clientesAtendidos, setClientesAtendidos] = useState(0); // Estado para el total de clientes atendidos
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Cargar los tickets desde Firestore
  useEffect(() => {
    const fetchTickets = async () => {
      const ticketDocRef = doc(db, 'Turns', 'Tickets'); // Documento único llamado 'current'
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

  // Obtener el total de clientes atendidos desde Firestore (historial)
  useEffect(() => {
    const fetchClientesAtendidos = async () => {
      const currentDate = new Date().toISOString().split('T')[0]; // Obtener la fecha actual en formato YYYY-MM-DD
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
  }, [tickets]); // Esto se ejecutará cada vez que cambien los tickets

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nombre.trim() === '') return;

    const now = new Date();
    const expiracion = new Date(now.getTime() + 14 * 60 * 60 * 1000); // 14 horas de expiración

    const newTicket: Ticket = {
      nombre,
      numero: nextNumber,
      expiracion: expiracion.toISOString(), // Convertimos la fecha a formato ISO
    };

    // Actualiza el array de tickets en el estado
    setTickets([...tickets, newTicket]);
    setNextNumber(nextNumber + 1);
    setNombre(''); // Limpiamos el input después de generar el ticket
  };

  const handleTicketComplete = async (ticket: Ticket) => {
    // Crear una copia del ticket para historial
    const completedTicket = {
      ...ticket,
      completadoEn: new Date().toISOString(), // Fecha y hora de la finalización
    };

    // Obtener la fecha actual en formato YYYY-MM-DD
    const currentDate = new Date().toISOString().split('T')[0];

    const historialDocRef = doc(db, 'Turns', 'HistorialTickets');

    // Verificar si el documento existe
    const docSnap = await getDoc(historialDocRef);

    if (docSnap.exists()) {
      const existingData = docSnap.data();
      // Si ya existe la fecha de hoy, actualizar los datos
      if (existingData && existingData[currentDate]) {
        // Agregar el ticket al array del día y actualizar el contador de clientes
        await updateDoc(historialDocRef, {
          [`${currentDate}.tickets`]: arrayUnion(completedTicket),
          [`${currentDate}.totalClientesAtendidos`]: (existingData[currentDate].totalClientesAtendidos || 0) + 1,
        });
      } else {
        // Si no existe la fecha de hoy, inicializar el array de tickets y el contador
        await updateDoc(historialDocRef, {
          [currentDate]: {
            tickets: [completedTicket],
            totalClientesAtendidos: 1,
          },
        });
      }
    } else {
      // Si el documento no existe, crearlo con la fecha de hoy y el primer ticket
      await setDoc(historialDocRef, {
        [currentDate]: {
          tickets: [completedTicket],
          totalClientesAtendidos: 1,
        },
      });
    }

    // Eliminar el ticket completado de la lista actual de tickets
    const updatedTickets = tickets.filter((t) => t.numero !== ticket.numero);
    await updateDoc(doc(db, 'Turns', 'Tickets'), {
      tickets: updatedTickets,
    });

    // Actualizar los tickets en el estado
    setTickets(updatedTickets);
  };

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="relative w-full">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="absolute right-0 top-0 z-10 bg-background"
          >
            {isDarkMode ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-slate-700" />}
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center space-y-8 py-8">
          <div className="relative w-32 h-32 md:w-40 md:h-40 mb-4">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Leonardo_Kino_XL_Logo_de_barberia_que_contenga_el_nombre_EuryB_3-uV4aYQ7Rdk94H7MLisfjU2JVdJju1Q.jpg"
              alt="Barberia Logo"
              className="object-contain w-full h-full"
              loading="lazy"
            />
          </div>

          <Card className="w-full max-w-sm bg-primary text-primary-foreground">
            <CardContent className="flex items-center justify-center space-x-4 py-6">
              <Users className="h-8 w-8" />
              <div className="text-center">
                <p className="text-sm font-medium">Clientes Atendidos</p>
                <p className="text-4xl font-bold tabular-nums">{clientesAtendidos}</p>
              </div>
            </CardContent>
          </Card>

          <div className="w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Reserva tu turno</h1>
            </div>

            <form onSubmit={handleSubmit} className="mb-8">
              <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
                <Input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Tu nombre"
                  className="flex-grow"
                />
                <Button type="submit" className="w-full sm:w-auto">
                  Reservar
                </Button>
              </div>
            </form>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tickets.map((ticket) => (
                <Card key={ticket.numero} className="bg-primary text-primary-foreground relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 hover:bg-primary-foreground/20"
                    onClick={() => handleTicketComplete(ticket)}
                    title="Marcar como atendido"
                  >
                    <CheckCircle className="h-5 w-5 text-foreground" />
                  </Button>
                  <CardHeader>
                    <CardTitle className="text-lg">Turno #{ticket.numero}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <p className="flex items-center text-sm">
                        <User className="mr-2 h-4 w-4" />
                        {ticket.nombre}
                      </p>
                      <p className="flex items-center text-sm">
                        <Clock className="mr-2 h-4 w-4" />
                        Expira: {new Date(ticket.expiracion).toLocaleString()}
                      </p>
                      <p className="flex items-center text-sm">
                        <Scissors className="mr-2 h-4 w-4" />
                        Corte: TBD
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
