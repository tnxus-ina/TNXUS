let keranjang = [];
let noFakturSekarang = '';

function updateHarga(el){
  let card = el.closest('.card');
  let hargaDasar = parseInt(card.dataset.harga);
  let ukuran = card.querySelector('.ukuran');
  let bahan = card.querySelector('.bahan');
  let tambahUkuran = parseInt(ukuran.selectedOptions[0].dataset.tambah);
  let tambahBahan = parseInt(bahan.selectedOptions[0].dataset.tambah);
  let totalHarga = hargaDasar + tambahUkuran + tambahBahan;
  card.querySelector('.harga').innerText = 'Rp ' + totalHarga.toLocaleString();
}

document.querySelectorAll('.slider-container').forEach(container=>{
  let wrapper = container.querySelector('.slider-wrapper');
  let imgs = wrapper.querySelectorAll('img');
  let dotsDiv = container.querySelector('.dots');
  imgs.forEach((_,i)=>{
    let dot = document.createElement('span');
    dot.classList.add('dot');
    if(i===0) dot.classList.add('active');
    dot.onclick = ()=>geserKeSlide(container,i);
    dotsDiv.appendChild(dot);
  });
  container.dataset.slide = 0;
});

function geserSlide(btn, arah){
  let container = btn.closest('.slider-container');
  let wrapper = container.querySelector('.slider-wrapper');
  let imgs = wrapper.querySelectorAll('img');
  let dots = container.querySelectorAll('.dot');
  let slide = parseInt(container.dataset.slide);
  slide += arah;
  if(slide < 0) slide = imgs.length - 1;
  if(slide >= imgs.length) slide = 0;
  container.dataset.slide = slide;
  wrapper.style.transform = `translateX(-${slide * 100}%)`;
  dots.forEach((d,i)=>d.classList.toggle('active', i===slide));
}

function geserKeSlide(container, index){
  let wrapper = container.querySelector('.slider-wrapper');
  let dots = container.querySelectorAll('.dot');
  container.dataset.slide = index;
  wrapper.style.transform = `translateX(-${index * 100}%)`;
  dots.forEach((d,i)=>d.classList.toggle('active', i===index));
}

function generateFaktur(){
  let now = new Date();
  let tanggal = now.getFullYear() + String(now.getMonth()+1).padStart(2,'0') + String(now.getDate()).padStart(2,'0');
  let kode = Math.random().toString(36).substring(2,6).toUpperCase();
  return `INV-${tanggal}-${kode}`;
}

function bukaKeranjang(){
  noFakturSekarang = generateFaktur();
  document.getElementById('noFaktur').innerText = noFakturSekarang;
  updateKeranjang();
  document.getElementById('modalKeranjang').style.display='block';
}

function tutupKeranjang(){document.getElementById('modalKeranjang').style.display='none'}

function tambahKeranjang(btn){
  let card = btn.closest('.card');
  let nama = card.dataset.nama;
  let hargaDasar = parseInt(card.dataset.harga);
  let ukuran = card.querySelector('.ukuran');
  let bahan = card.querySelector('.bahan');
  let qty = parseInt(card.querySelector('.qty').value);
  let tambahUkuran = parseInt(ukuran.selectedOptions[0].dataset.tambah);
  let tambahBahan = parseInt(bahan.selectedOptions[0].dataset.tambah);
  let hargaFinal = hargaDasar + tambahUkuran + tambahBahan;

  keranjang.push({nama,harga:hargaFinal,ukuran:ukuran.value,bahan:bahan.selectedOptions[0].text,qty});
  updateKeranjang();
  btn.innerText = 'Ditambahkan!';
  setTimeout(()=>btn.innerText='+ Tambah Keranjang',1200);
}

function hapusItem(index){
  keranjang.splice(index,1);
  updateKeranjang();
}

function updateKeranjang(){
  document.getElementById('cartCount').innerText = keranjang.length;
  let isi = document.getElementById('isiKeranjang');
  let total = 0;
  isi.innerHTML = '';
  if(keranjang.length === 0){
    isi.innerHTML = '<p style="text-align:center;color:#888;padding:20px">Keranjang masih kosong</p>';
  }
  keranjang.forEach((item,i)=>{
    total += item.harga * item.qty;
    isi.innerHTML += `
      <div class="item-keranjang">
        <div class="item-info">
          ${item.nama}<br>
          <small>Size: ${item.ukuran} | ${item.bahan}<br>Qty: ${item.qty} | Rp ${(item.harga*item.qty).toLocaleString()}</small>
        </div>
        <button class="btn-hapus" onclick="hapusItem(${i})">Hapus</button>
      </div>
    `;
  });
  document.getElementById('totalHarga').innerText = total.toLocaleString();
}

function checkoutWA(){
  if(keranjang.length===0){alert('Keranjang kosong!');return}
  let nama = document.getElementById('namaPembeli').value.trim();
  let noWA = document.getElementById('noWA').value.trim();
  let email = document.getElementById('email').value.trim();
  let alamat = document.getElementById('alamat').value.trim();
  let metode = document.getElementById('metodeBayar').value;
  if(!nama ||!noWA ||!alamat){
    alert('Mohon isi Nama, No WA, dan Alamat lengkap');
    return;
  }
  let pesan = `*FAKTUR PEMESAN*%0A`;
  pesan += `No Faktur: ${noFakturSekarang}%0A`;
  pesan += `Tanggal: ${new Date().toLocaleDateString('id-ID')}%0A%0A`;
  pesan += `*DETAIL ORDER*%0A`;
  let total = 0;
  keranjang.forEach(item=>{
    pesan += `• ${item.nama} Size ${item.ukuran} | ${item.bahan} x${item.qty} = Rp ${(item.harga*item.qty).toLocaleString()}%0A`;
    total += item.harga * item.qty;
  });
  pesan += `%0A*DATA PEMBELI*%0A`;
  pesan += `Nama: ${nama}%0A`;
  pesan += `No WA: ${noWA}%0A`;
  pesan += `Email: ${email || '-'}%0A`;
  pesan += `Alamat: ${alamat}%0A`;
  pesan += `Metode Bayar: ${metode}%0A`;
  pesan += `%0A*Total Bayar: Rp ${total.toLocaleString()}*%0A%0A`;
  pesan += `Mohon info rekening/QRIS untuk pembayaran. Terima kasih`;
  let noAdmin = '6281234567890'; // GANTI DENGAN NOMOR WA KAMU
  window.open(`https://wa.me/${noAdmin}?text=${pesan}`,'_blank');
  keranjang = [];
  updateKeranjang();
  tutupKeranjang();
  alert('Pesanan terkirim! No Faktur kamu: ' + noFakturSekarang);
}

