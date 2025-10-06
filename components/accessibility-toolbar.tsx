"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accessibility, Eye, Type, Volume2, Keyboard, RotateCcw, X, Settings } from "lucide-react"
import { useAccessibility } from "./accessibility-provider"

export function AccessibilityToolbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { settings, updateSetting, resetSettings } = useAccessibility()

  return (
    <>
      {/* Floating Accessibility Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-40 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2"
        aria-label="Open accessibility settings"
      >
        <Accessibility className="h-6 w-6" />
      </Button>

      {/* Accessibility Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="flex items-center space-x-2">
                <Accessibility className="h-5 w-5 text-primary" />
                <span>Accessibility Settings</span>
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                aria-label="Close accessibility settings"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* High Contrast */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="high-contrast" className="flex items-center space-x-2">
                    <Eye className="h-4 w-4" />
                    <span>High Contrast Mode</span>
                  </Label>
                  <p className="text-sm text-muted-foreground">Increases color contrast for better visibility</p>
                </div>
                <Switch
                  id="high-contrast"
                  checked={settings.highContrast}
                  onCheckedChange={(checked) => updateSetting("highContrast", checked)}
                  aria-describedby="high-contrast-desc"
                />
              </div>

              {/* Font Size */}
              <div className="space-y-2">
                <Label className="flex items-center space-x-2">
                  <Type className="h-4 w-4" />
                  <span>Font Size</span>
                </Label>
                <Select
                  value={settings.fontSize}
                  onValueChange={(value: "small" | "medium" | "large") => updateSetting("fontSize", value)}
                >
                  <SelectTrigger aria-label="Select font size">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium (Default)</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Screen Reader Optimization */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="screen-reader" className="flex items-center space-x-2">
                    <Volume2 className="h-4 w-4" />
                    <span>Screen Reader Optimization</span>
                  </Label>
                  <p className="text-sm text-muted-foreground">Optimizes interface for screen readers</p>
                </div>
                <Switch
                  id="screen-reader"
                  checked={settings.screenReaderOptimized}
                  onCheckedChange={(checked) => updateSetting("screenReaderOptimized", checked)}
                />
              </div>

              {/* Keyboard Navigation */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="keyboard-nav" className="flex items-center space-x-2">
                    <Keyboard className="h-4 w-4" />
                    <span>Enhanced Keyboard Navigation</span>
                  </Label>
                  <p className="text-sm text-muted-foreground">Improves keyboard navigation and focus indicators</p>
                </div>
                <Switch
                  id="keyboard-nav"
                  checked={settings.keyboardNavigation}
                  onCheckedChange={(checked) => updateSetting("keyboardNavigation", checked)}
                />
              </div>

              {/* Reduced Motion */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="reduced-motion" className="flex items-center space-x-2">
                    <Settings className="h-4 w-4" />
                    <span>Reduce Motion</span>
                  </Label>
                  <p className="text-sm text-muted-foreground">Minimizes animations and transitions</p>
                </div>
                <Switch
                  id="reduced-motion"
                  checked={settings.reducedMotion}
                  onCheckedChange={(checked) => updateSetting("reducedMotion", checked)}
                />
              </div>

              {/* Reset Button */}
              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={resetSettings}
                  className="w-full flex items-center space-x-2 bg-transparent"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Reset to Defaults</span>
                </Button>
              </div>

              {/* Keyboard Shortcuts Info */}
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Keyboard Shortcuts</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Skip to main content:</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-xs">Tab</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Open accessibility:</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-xs">Alt + A</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Toggle high contrast:</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-xs">Alt + H</kbd>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
