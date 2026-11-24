/* Show supplied brand assets only after they load. */
for (const image of document.querySelectorAll('.brand-image,.naranja-image')) { const show=()=>{image.hidden=false;if(image.classList.contains('brand-image'))image.nextElementSibling.hidden=true;};image.addEventListener('load',show);if(image.complete&&image.naturalWidth>0)show();}
