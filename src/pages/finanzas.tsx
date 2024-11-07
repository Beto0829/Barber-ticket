'use client'

import { useState } from 'react'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { CalendarIcon, Menu, X } from 'lucide-react'
import { addDays, format } from 'date-fns'
import { es } from 'date-fns/locale'
import { DateRange } from 'react-day-picker'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { To, useNavigate } from 'react-router-dom'

export default function FinanzasDashboard() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(2023, 0, 20),
    to: addDays(new Date(2023, 0, 20), 20),
  })

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [vista, setVista] = useState('dia')
  const navigate = useNavigate()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  }

  const handleNavege = (ruta: To) => {
    navigate(ruta)
  };

  // Datos de ejemplo
  const datosDiarios = [
    { fecha: '2023-05-01', ganancias: 150, cortes: 10 },
    { fecha: '2023-05-02', ganancias: 200, cortes: 15 },
    { fecha: '2023-05-03', ganancias: 180, cortes: 12 },
    { fecha: '2023-05-04', ganancias: 220, cortes: 18 },
    { fecha: '2023-05-05', ganancias: 190, cortes: 14 },
  ]

  const datosMensuales = [
    { mes: 'Enero', ganancias: 4500, cortes: 300 },
    { mes: 'Febrero', ganancias: 4200, cortes: 280 },
    { mes: 'Marzo', ganancias: 4800, cortes: 320 },
    { mes: 'Abril', ganancias: 5000, cortes: 350 },
    { mes: 'Mayo', ganancias: 5200, cortes: 360 },
  ]

  const datos = vista === 'dia' ? datosDiarios : datosMensuales

  return (
    <div className="flex-col md:flex bg-gray-900 min-h-screen">
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
          <button onClick={() => handleNavege('/admin')} className="w-full text-left p-2 hover:bg-gray-700 mb-2">
            Tickets
          </button>
          {/* Puedes seguir añadiendo más botones aquí y aplicar `mb-2` en cada uno */}
        </div>
      )}
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          {/* <h2 className="text-lg font-semibold text-white">Finanzas Barbería</h2> */}
        </div>
      </div>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-white mr-4">Dashboard</h2>
          <div className="flex items-center space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-[260px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "LLL dd, y", { locale: es })} -{" "}
                        {format(date.to, "LLL dd, y", { locale: es })}
                      </>
                    ) : (
                      format(date.from, "LLL dd, y", { locale: es })
                    )
                  ) : (
                    <span>Selecciona un rango de fechas</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            <Select value={vista} onValueChange={setVista}>
              <SelectTrigger className="w-[180px] text-white">
                <SelectValue placeholder="Selecciona vista" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dia">Vista por día</SelectItem>
                <SelectItem value="mes">Vista por mes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ganancias Totales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${datos.reduce((sum, d) => sum + d.ganancias, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                +20.1% respecto al periodo anterior
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Cortes Totales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {datos.reduce((sum, d) => sum + d.cortes, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                +15% respecto al periodo anterior
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Promedio de Ganancias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(datos.reduce((sum, d) => sum + d.ganancias, 0) / datos.length).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Por {vista === 'dia' ? 'día' : 'mes'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Promedio de Cortes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(datos.reduce((sum, d) => sum + d.cortes, 0) / datos.length).toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">
                Por {vista === 'dia' ? 'día' : 'mes'}
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Ganancias</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={datos}>
                  <XAxis
                    dataKey={vista === 'dia' ? 'fecha' : 'mes'}
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Bar dataKey="ganancias" fill="#adfa1d" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Cortes de Pelo</CardTitle>
              <CardDescription>
                Número de cortes por {vista === 'dia' ? 'día' : 'mes'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={datos}>
                  <XAxis
                    dataKey={vista === 'dia' ? 'fecha' : 'mes'}
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Bar dataKey="cortes" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}