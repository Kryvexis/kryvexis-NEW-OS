// @ts-nocheck
import ProductEditUI from "./ui";

type Params = { id: string };

export default async function Page({ params }: { params: Promise<Params> }) {
  const { id } = params;
  return <ProductEditUI id={id} />;
}
