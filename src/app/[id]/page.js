import Portal from '@/Components/Portal'

import { getAllData } from '@/utils'

export default async function Page({ params }) {
  const data = await getData()
  return (
    <Portal track={params.id-1} data={data}/>
  )
}

async function getData() {
  const res = await getAllData()
  // console.log(res)
  return res
}