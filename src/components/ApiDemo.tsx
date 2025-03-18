"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ExternalLink } from "lucide-react"
import Link from "next/link"

interface ApiResponse {
  valid: boolean
  summary: {
    summary: string
    cool_facts: string[]
  }
  githubUrl: string
}

export default function ApiDemo() {
  const [githubUrl, setGithubUrl] = useState("https://github.com/assafelovic/gpt-researcher")
  const [apiKey, setApiKey] = useState("dandi-2pjaikfu-bi4uyry3a")
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<ApiResponse>({
    valid: true,
    summary: {
      summary:
        "GPT Researcher is an open deep research agent designed for web and local research tasks, providing detailed and unbiased research reports with citations. It offers customization options and addresses misinformation, speed, determinism, and reliability. The project aims to empower individuals and organizations with accurate and factual information through AI.",
      cool_facts: [
        "Utilizes 'planner' and 'execution' agents for generating research questions and gathering information",
        "Includes Deep Research feature for recursive research workflow with configurable depth and breadth",
        "Offers frontend applications for improved user experience and streamlined research process",
        "Welcomes contributions and has a roadmap for future development",
        "Provides support through a community Discord and author email",
      ],
    },
    githubUrl: "https://github.com/assafelovic/gpt-researcher",
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    // Simulate API call with a timeout
    // In a real implementation, you would make an actual fetch request to your API
    setTimeout(() => {
      setResponse({
        valid: true,
        summary: {
          summary: `Analysis of ${githubUrl}: This repository contains a project that analyzes GitHub repositories and provides insights about their structure, contributors, and features.`,
          cool_facts: [
            "Created in 2023 with regular updates",
            "Has contributors from multiple countries",
            "Implements modern web technologies",
            "Features comprehensive documentation",
            "Includes automated testing",
          ],
        },
        githubUrl: githubUrl,
      })
      setLoading(false)
    }, 1500)
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Try the API</CardTitle>
        <CardDescription>See how Dandi analyzes GitHub repositories in real-time</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="request" className="grid">
          <TabsList className="mb-4">
            <TabsTrigger value="request" className="px-4">Request</TabsTrigger>
            <TabsTrigger value="response" className="px-4">Response</TabsTrigger>
          </TabsList>

          <TabsContent value="request" className="mt-2">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="endpoint" className="text-sm">Endpoint</Label>
                  <div className="text-sm text-muted-foreground">POST</div>
                </div>
                <Input
                  id="endpoint"
                  type="text"
                  value="https://udemy-cursor-ai-ide-dandi.vercel.app/api/github-summarizer"
                  readOnly
                  className="font-mono text-sm bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="api-key" className="text-sm">API Key</Label>
                <Input
                  id="api-key"
                  type="text"
                  value={apiKey}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApiKey(e.target.value)}
                  className="font-mono text-sm"
                  placeholder="Your API key"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="github-url" className="text-sm">GitHub Repository URL</Label>
                <Input
                  id="github-url"
                  value={githubUrl}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGithubUrl(e.target.value)}
                  type="text"
                  className="font-mono text-sm"
                  placeholder="https://github.com/username/repository"
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Repository...
                  </>
                ) : (
                  "Send Request"
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="response" className="mt-2">
            <div className="rounded-md bg-muted p-4 overflow-auto max-h-[400px]">
              <pre className="text-sm font-mono">{JSON.stringify(response, null, 2)}</pre>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" asChild>
          <Link href="/documentation">
            Documentation <ExternalLink className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <div className="text-sm text-muted-foreground">Response time: ~400ms</div>
      </CardFooter>
    </Card>
  )
} 