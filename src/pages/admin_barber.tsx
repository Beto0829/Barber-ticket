import { useState, useEffect } from 'react';
import { db, doc, getDoc, updateDoc, arrayUnion, setDoc } from './firebase_config'; // Asegúrate de tener la configuración de Firebase
import { Button } from '@/components/ui/button'; // Componentes UI
import { Input } from '@/components/ui/input'; // Componentes UI
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Componentes UI
import {CheckCircle, User, Clock, Users } from 'lucide-react'; // Iconos

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
      const currentDate = new Date().toISOString().split('T')[0];
      const historialDocRef = doc(db, 'Turns', 'HistorialTickets');
      const docSnap = await getDoc(historialDocRef);

      if (docSnap.exists()) {
        const existingData = docSnap.data();
        if (existingData && existingData[currentDate]) {
          setClientesAtendidos(existingData[currentDate].totalClientesAtendidos || 0);
          console.log(clientesAtendidos)
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
      expiracion: expiracion.toISOString(),
    };
  
    try {
      // Actualiza el array de tickets en Firestore, agregando solo el nuevo ticket
      const ticketDocRef = doc(db, 'Turns', 'Tickets');
      await updateDoc(ticketDocRef, {
        tickets: arrayUnion(newTicket),
      });
  
      // Actualiza el estado local con el nuevo ticket
      setTickets([...tickets, newTicket]);
      setNextNumber(nextNumber + 1);
      setNombre(''); // Limpiamos el input después de generar el ticket
    } catch (error) {
      console.error("Error al guardar el ticket en Firestore:", error);
    }
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
  <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
    <div className="relative w-full max-w-md px-4 py-12">
      
      {/* Botón de Cerrar Sesión */}
      <div className="absolute top-4 right-4">
        <Button 
          variant="outline"
          className="bg-white/20 hover:bg-white/30 text-foreground"
        >
          Cerrar Sesión
        </Button>
      </div>

      {/* Contenido Principal */}
      <div className="space-y-8 text-center">
        
        {/* Logo */}
        <div className="flex justify-center">
          <img
            src="/logo.png"
            alt="EuryBarber Logo"
            className="w-32 h-32 object-contain"
          />
        </div>

        {/* Contador de clientes */}
        <Card className="bg-black text-white">
          <CardContent className="flex items-center gap-4 p-4">
            <Users className="h-8 w-8" />
            <div>
              <p className="text-sm">Clientes Atendidos</p>
              <p className="text-4xl font-bold">{clientesAtendidos}</p>
            </div>
          </CardContent>
        </Card>

        {/* Formulario de reserva */}
        <div>
          <h1 className="text-2xl font-bold mb-4">Reserva tu turno</h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre"
              className="bg-white"
            />
            <Button type="submit" className="w-full bg-black text-white hover:bg-black/90">
              Reservar
            </Button>
          </form>
        </div>

        {/* Lista de tickets */}
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
                <p className="flex items-center text-sm">
                  <User className="mr-2 h-4 w-4" />
                  {ticket.nombre}
                </p>
                <p className="flex items-center text-sm">
                  <Clock className="mr-2 h-4 w-4" />
                  Expira: {new Date(ticket.expiracion).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  </div>
);

}
