"use client"

import { useI18n } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function LanguageSelector() {
  const { language, setLanguage } = useI18n()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 rounded-full hover:bg-primary/10 p-0 overflow-hidden"
          title="Language / Idioma"
        >
          {language === "en" ? (
            <img src="/images/design-mode/us.png" alt="US Flag" className="w-full h-full object-cover rounded-full" />
          ) : (
            <img
              src="/images/design-mode/es.png"
              alt="Spain Flag"
              className="w-full h-full object-cover rounded-full"
            />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="glass-card border-primary/30 min-w-[100px] mt-2 z-[9999]">
        <DropdownMenuItem
          onClick={() => setLanguage("en")}
          className={`cursor-pointer gap-2 py-1.5 ${language === "en" ? "bg-primary/10 text-primary" : ""}`}
        >
          <img src="/images/design-mode/us.png" alt="US Flag" className="w-5 h-5 rounded-full object-cover" />
          <span className="font-medium">US</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage("es")}
          className={`cursor-pointer gap-2 py-1.5 ${language === "es" ? "bg-primary/10 text-primary" : ""}`}
        >
          <img src="/images/design-mode/es.png" alt="Spain Flag" className="w-5 h-5 rounded-full object-cover" />
          <span className="font-medium">ES</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
