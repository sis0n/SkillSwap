import { ArrowRight, BookOpen, Users, MessageSquare } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const features = [
  {
    icon: BookOpen,
    title: "Teach What You Know",
    description:
      "Share your expertise with others and help them grow.",
  },
  {
    icon: Users,
    title: "Learn New Skills",
    description:
      "Discover people who can teach you the skills you want to learn.",
  },
  {
    icon: MessageSquare,
    title: "Exchange Knowledge",
    description:
      "Connect, schedule sessions, and learn together.",
  },
]

export default function Landing() {
  return (
    <div>
      <section className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Learn by Teaching,
          <br />
          Teach by Learning
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          SkillSwap connects people who want to learn with people who want to
          teach. No money required — just knowledge.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Button size="lg" asChild>
            <Link to="/register">
              Get Started <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-24">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardContent className="flex flex-col items-center p-6 text-center">
                <feature.icon className="size-12 text-primary" />
                <h3 className="mt-4 font-semibold text-lg">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
