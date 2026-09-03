import React, { useRef, useState } from 'react'
import { jsPDF } from 'jspdf'

export default function BillingManager({
  inventory,
  updateInventory,
  customers,
  updateCustomers,
  addSale,
}) {
  const [bill, setBill] = useState({
    customerId: '',
    items: [],
  })
  const [selectedProduct, setSelectedProduct] = useState('')
  const [quantity, setQuantity] = useState(1)
  const billRef = useRef(null)

  const addItem = () => {
    const product = inventory.find((p) => p.id === Number(selectedProduct))
    if (product && product.quantity >= quantity) {
      setBill({
        ...bill,
        items: [...bill.items, { ...product, qty: quantity }],
      })
      setSelectedProduct('')
      setQuantity(1)
    } else {
      alert('Product not available or insufficient quantity!')
    }
  }

  const removeItem = (index) => {
    setBill({ ...bill, items: bill.items.filter((_, i) => i !== index) })
  }

  const generateBill = () => {
    if (!bill.customerId) {
      alert('Please select a customer!')
      return
    }
    if (bill.items.length === 0) {
      alert('Please add items to the bill!')
      return
    }

    const total = bill.items.reduce(
      (sum, item) => sum + item.price * item.qty,
      0,
    )
    const invoice = `INV-${Date.now()}`
    const sale = {
      invoice,
      customerId: Number(bill.customerId),
      items: bill.items,
      total,
      date: new Date(),
    }

    addSale(sale)

    // Update inventory
    updateInventory(
      inventory.map((p) => {
        const sold = bill.items.find((i) => i.id === p.id)
        return sold ? { ...p, quantity: p.quantity - sold.qty } : p
      }),
    )

    // Update customer history
    updateCustomers(
      customers.map((c) =>
        c.id === Number(bill.customerId)
          ? { ...c, history: [...c.history, sale] }
          : c,
      ),
    )

    alert(
      `Bill generated successfully!\nInvoice: ${invoice}\nTotal: PKR ${total}`,
    )
    setBill({ customerId: '', items: [] })
  }

  const downloadPDF = () => {
    if (bill.items.length === 0) {
      alert('Please add items to the bill before downloading!')
      return
    }

    const customer = customers.find((c) => c.id === Number(bill.customerId))

    try {
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()

      // Header
      pdf.setFontSize(24)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Dr. Aqua', pageWidth / 2, 20, { align: 'center' })

      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'normal')
      pdf.text('Water Filtration Solutions', pageWidth / 2, 28, {
        align: 'center',
      })

      // Line separator
      pdf.setLineWidth(0.5)
      pdf.line(20, 35, pageWidth - 20, 35)

      // Receipt title
      pdf.setFontSize(18)
      pdf.setFont('helvetica', 'bold')
      pdf.text('RECEIPT', pageWidth / 2, 45, { align: 'center' })

      // Invoice details
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      const invoiceNo = `INV-${Date.now()}`
      pdf.text(`Invoice: ${invoiceNo}`, 20, 55)
      pdf.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 60, 55)

      if (customer) {
        pdf.text(`Customer: ${customer.name}`, 20, 62)
        pdf.text(`Contact: ${customer.contact}`, 20, 69)
      }

      // Table header
      let yPos = 85
      pdf.setFillColor(240, 240, 240)
      pdf.rect(20, yPos - 6, pageWidth - 40, 10, 'F')
      pdf.setFont('helvetica', 'bold')
      pdf.text('Item', 25, yPos)
      pdf.text('Qty', 100, yPos)
      pdf.text('Price', 125, yPos)
      pdf.text('Total', 160, yPos)

      // Table rows
      pdf.setFont('helvetica', 'normal')
      yPos += 12

      bill.items.forEach((item) => {
        pdf.text(item.name.substring(0, 30), 25, yPos)
        pdf.text(item.qty.toString(), 100, yPos)
        pdf.text(`PKR ${item.price.toFixed(2)}`, 125, yPos)
        pdf.text(`PKR ${(item.price * item.qty).toFixed(2)}`, 160, yPos)
        yPos += 8
      })

      // Line before total
      yPos += 5
      pdf.line(20, yPos, pageWidth - 20, yPos)
      yPos += 10

      // Total
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(14)
      pdf.text(`Total: PKR ${total.toFixed(2)}`, pageWidth - 60, yPos)

      // Footer
      yPos += 25
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.text('Thank you for your business!', pageWidth / 2, yPos, {
        align: 'center',
      })
      pdf.text('Dr. Aqua - Pure Water, Pure Life', pageWidth / 2, yPos + 7, {
        align: 'center',
      })

      pdf.save(`receipt-${invoiceNo}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF: ' + error.message)
    }
  }

  const total = bill.items.reduce((sum, item) => sum + item.price * item.qty, 0)

  return (
    <div className='bg-white rounded-lg shadow-md p-6'>
      <h2 className='text-2xl font-bold mb-4 text-gray-900'>
        Billing & Receipts
      </h2>

      <div className='mb-6 flex flex-wrap gap-3'>
        <select
          value={bill.customerId}
          onChange={(e) => setBill({ ...bill, customerId: e.target.value })}
          className='flex-1 min-w-[150px] px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
        >
          <option value=''>Select Customer</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          className='flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
        >
          <option value=''>Select Product</option>
          {inventory
            .filter((p) => p.quantity > 0)
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (Stock: {p.quantity}) - ${p.price}
              </option>
            ))}
        </select>

        <input
          type='number'
          value={quantity}
          onChange={(e) => setQuantity(+e.target.value)}
          min='1'
          className='w-20 px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
        />

        <button
          onClick={addItem}
          className='px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors'
        >
          Add Item
        </button>
      </div>

      <div
        ref={billRef}
        className='mb-6 p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50'
      >
        <h3 className='text-xl font-semibold mb-4 text-gray-900'>
          Bill Preview
        </h3>

        {bill.items.length > 0 ? (
          <>
            <table className='w-full mb-4'>
              <thead>
                <tr className='border-b'>
                  <th className='text-left py-2 text-gray-900'>Product</th>
                  <th className='text-right py-2 text-gray-900'>Qty</th>
                  <th className='text-right py-2 text-gray-900'>Price</th>
                  <th className='text-right py-2 text-gray-900'>Subtotal</th>
                  <th className='text-right py-2 text-gray-900'>Action</th>
                </tr>
              </thead>
              <tbody>
                {bill.items.map((item, i) => (
                  <tr key={i} className='border-b'>
                    <td className='py-2 text-gray-900'>{item.name}</td>
                    <td className='text-right py-2 text-gray-900'>
                      {item.qty}
                    </td>
                    <td className='text-right py-2 text-gray-900'>
                      ${item.price}
                    </td>
                    <td className='text-right py-2 text-gray-900'>
                      ${item.price * item.qty}
                    </td>
                    <td className='text-right py-2'>
                      <button
                        onClick={() => removeItem(i)}
                        className='text-red-500 hover:text-red-700'
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className='text-right text-xl font-bold text-gray-900'>
              Total: ${total}
            </div>
          </>
        ) : (
          <p className='text-gray-500 text-center py-4'>
            No items added yet. Select products above to create a bill.
          </p>
        )}
      </div>

      <div className='flex gap-3'>
        <button
          onClick={generateBill}
          className='px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors'
        >
          Generate Bill
        </button>
        <button
          onClick={downloadPDF}
          disabled={bill.items.length === 0}
          className='px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-md font-medium transition-colors'
        >
          Download PDF
        </button>
      </div>
    </div>
  )
}
