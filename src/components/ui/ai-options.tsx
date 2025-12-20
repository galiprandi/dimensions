import { Braces } from "lucide-react";
import { Button } from "./button";
import { ButtonGroup, ButtonGroupSeparator } from "./button-group";
import { useAIConclusions } from "@/hooks/useAIConclusions";

export function AiOptions({interviewId}:{interviewId: string}) {
    const { data: _data, status: _status, refetch: _refetch } = useAIConclusions({
        interviewId,
    });
   
    
    return <><ButtonGroup>
            <Button title='Copiar prompt al portapapeles' onClick={() => {}} variant="outline" size="sm" className="rounded-r-none border-r-0">
              <Braces className="h-4 w-4 mr-2" />
            </Button>
            <ButtonGroupSeparator />
           
          </ButtonGroup>
           {/* <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={handleGenerateAI} className="rounded-l-none">
        enableProfile: ENABLE_PROFILE_IN_CONCLUSIONS,
      })
  return <><ButtonGroup>
            <Button title='Copiar prompt al portapapeles' onClick={() => {}} variant="outline" size="sm" className="rounded-r-none border-r-0">
              <Braces className="h-4 w-4 mr-2" />
            </Button>
            <ButtonGroupSeparator />
           
          </ButtonGroup>
           {/* <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={handleGenerateAI} className="rounded-l-none">
                  <Brain className="h-4 w-4 mr-2" />
                  IA
                </Button>
              </DialogTrigger>
              <DialogContent
                className="max-w-3xl max-h-[80vh] overflow-y-auto"
                onEscapeKeyDown={(e) => e.preventDefault()}
                onPointerDownOutside={(e) => e.preventDefault()}
                onInteractOutside={(e) => e.preventDefault()}
                description="Conclusiones generadas con AI a partir de tus notas"
              >
                <div className="relative">
                  {simulateUnavailable ? (
                    <AiUnavailableModal onClose={() => setDialogOpen(false)} />
                  ) : (
                    <>
                      <DialogHeader className="sticky top-0 z-10 flex flex-row items-start justify-between gap-4 pr-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 py-2">
                        <div className="space-y-1">
                          <DialogTitle>Conclusiones generadas con AI</DialogTitle>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            Generando conclusiones a partir de tus notas. Esto puede tomar algunos segundos, no cierres el modal.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              aiQuery.refetch()
                            }}
                            disabled={aiQuery.isLoading}
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Generar
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDialogOpen(false)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </DialogHeader>
                      {simulateUnavailable ? (
                        <AiUnavailableModal onClose={() => setDialogOpen(false)} />
                      ) : aiQuery.data ? (
                        <div className="space-y-3">
                          {aiQuery.data.parsed.length > 0 ? (
                            <AiConclusionsEditor items={aiQuery.data.parsed} dimensions={dimensions} stacks={stack} />
                          ) : (
                            aiQuery.data.raw
                          )}
                        </div>
                      ) : aiQuery.isLoading ? (
                        <div className="space-y-4">
                          <div className="space-y-3 text-sm">
                            {aiQuery.steps.map((step, index) => (
                              <div key={index} className="flex items-center gap-3">
                                {step.status === 'completed' && <Check className="h-4 w-4 text-green-500" />}
                                {step.status === 'in-progress' && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                                {step.status === 'pending' && <div className="h-4 w-4" />}
                                <span className={step.status === 'in-progress' ? 'font-medium' : 'text-muted-foreground'}>
                                  {step.text}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3 py-8 text-sm text-muted-foreground">
                          <p className="text-center">No hay conclusiones generadas aún. Haz clic en "IA" para generarlas.</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog> */}
          </>}