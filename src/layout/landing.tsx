import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { ThemeToggle } from "@/components/theme-toggle"
import { useNavigate } from 'react-router-dom'
import { useEffect } from "react"
import designService from "@/services/api/design.service"

export function Landing() {
  const navigate = useNavigate();

  useEffect(() => {

    const test = async ()=>{

      const patterns = await designService.getPatterns();
      console.log(patterns);
      
      const principles = await designService.getPrinciples();
      console.log(principles);
    }

    test();
    
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <div className="mx-auto max-w-7xl">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center max-w-7xl mx-auto px-4">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#products">
                    Products
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#features">
                    Features
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink 
                    className={navigationMenuTriggerStyle()} 
                    onClick={() => navigate('/about')}
                  >
                    About
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            <div className="ml-auto flex items-center space-x-4">
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Main Content Wrapper */}
        <main className="max-w-7xl mx-auto px-4">
          {/* Hero Section */}
          <section className="container py-24 space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col items-center text-center space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Welcome to Our Platform
              </h1>
              <p className="max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Discover the next generation of digital solutions
              </p>
              <Button size="lg" onClick={() => navigate('/code-flow')}>
                Get Started
              </Button>
            </div>
          </section>

          {/* Product Showcase */}
          <section id="products" className="container py-12 space-y-8 max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center">Our Products</h2>
            <Carousel className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto">
              <CarouselContent>
                {Array.from({ length: 3 }).map((_, index) => (
                  <CarouselItem key={index}>
                    <div className="p-1">
                      <div className="flex aspect-square items-center justify-center rounded-lg border bg-card p-6">
                        <span className="text-3xl font-semibold">Product {index + 1}</span>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </section>

          {/* How It Works */}
          <section id="features" className="container py-12 space-y-8 max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['Discover', 'Create', 'Deploy'].map((step, index) => (
                <div key={index} className="flex flex-col items-center space-y-4 p-6 border rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-semibold">{step}</h3>
                  <p className="text-center text-muted-foreground">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  </p>
                </div>
              ))}
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t">
          <div className="container py-8 max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Company</h3>
                <ul className="space-y-1">
                  <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">About</a></li>
                  <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Careers</a></li>
                  <li><a href="#" className="text-sm text-muted-foreground hover:text-primary">Contact</a></li>
                </ul>
              </div>
              {/* Add more footer columns as needed */}
            </div>
            <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
              © 2024 Your Company. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
