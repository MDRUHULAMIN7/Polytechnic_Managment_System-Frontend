import { RootNavbar } from "@/components/common/root-navbar";

export default async function PublicLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <RootNavbar />
      {children}
    </>
  );
}
