'use client'
import NoteEditorClient from "./NoteEditorClient";
import { Suspense } from "react";
import { Center, Spinner } from "@chakra-ui/react";

export default function NoteEditorPage() {
  return (
    <Suspense fallback={<Center py={20}><Spinner color="teal.500" /></Center>}>
      <NoteEditorClient />
    </Suspense>
  );
}
